"""Export XML de toute la base : SQLite → XML → validation par base_de_donnees.xsd."""
import re
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path

from lxml import etree

from src.api.errors import ApiError
from src.api.repositories import export_repository as repository


XSD_PATH = Path(__file__).resolve().parents[2] / 'formats' / 'xml' / 'base_de_donnees.xsd'
# Caractères interdits en XML 1.0 (certains textes saisis pourraient en contenir).
ILLEGAL_XML = re.compile('[\x00-\x08\x0b\x0c\x0e-\x1f￾￿]')


@lru_cache(maxsize=1)
def _schema():
    return etree.XMLSchema(etree.parse(str(XSD_PATH)))


def _text(value):
    return ILLEGAL_XML.sub('', str(value))


def _datetime(value):
    """SQLite stocke « 2026-11-04 08:22:05 » ; xs:dateTime attend le « T »."""
    return _text(value).replace(' ', 'T')


def _fields(parent, row, mapping):
    """Ajoute un sous-élément par couple (colonne, nom) ; une valeur NULL est omise."""
    for column, name in mapping:
        if row[column] is not None:
            etree.SubElement(parent, name).text = _text(row[column])


def _address(parent, row):
    if row['rue'] is not None:
        _fields(etree.SubElement(parent, 'adresse'), row,
                (('rue', 'rue'), ('code_postal', 'codePostal'), ('ville', 'ville')))


def _group(rows, key):
    grouped = {}
    for row in rows:
        grouped.setdefault(row[key], []).append(row)
    return grouped


def build_xml(connection):
    root = etree.Element(
        'baseDeDonnees',
        dateExport=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    )

    node = etree.SubElement(root, 'equipements')
    for row in repository.find_equipements(connection):
        etree.SubElement(node, 'equipement', id=str(row['id'])).text = _text(row['nom'])

    node = etree.SubElement(root, 'utilisateurs')
    for row in repository.find_utilisateurs(connection):
        item = etree.SubElement(node, 'utilisateur', id=str(row['id']), role=row['role'],
                                dateCreation=_datetime(row['date_creation']))
        _fields(item, row, (('prenom', 'prenom'), ('nom', 'nom'),
                            ('email', 'email'), ('telephone', 'telephone')))
        _address(item, row)

    photos = _group(repository.find_photos(connection), 'logement_id')
    amenities = _group(repository.find_logement_equipements(connection), 'logement_id')
    node = etree.SubElement(root, 'logements')
    for row in repository.find_logements(connection):
        item = etree.SubElement(
            node, 'logement', id=str(row['id']), proprietaireId=str(row['proprietaire_id']),
            statut=row['statut'], dateCreation=_datetime(row['date_creation']),
        )
        _fields(item, row, (('titre', 'titre'), ('description', 'description'),
                            ('type_logement', 'typeLogement'), ('capacite', 'capacite'),
                            ('prix_nuit_centimes', 'prixNuitCentimes')))
        _address(item, row)
        photos_node = etree.SubElement(item, 'photos')
        for photo in photos.get(row['id'], []):
            etree.SubElement(photos_node, 'photo', position=str(photo['position'])).text = _text(photo['url'])
        amenities_node = etree.SubElement(item, 'equipementsLogement')
        for amenity in amenities.get(row['id'], []):
            etree.SubElement(amenities_node, 'equipementRef', ref=str(amenity['equipement_id']))

    node = etree.SubElement(root, 'disponibilites')
    for row in repository.find_disponibilites(connection):
        item = etree.SubElement(node, 'disponibilite', id=str(row['id']),
                                logementId=str(row['logement_id']))
        _fields(item, row, (('date_debut', 'dateDebut'), ('date_fin', 'dateFin')))

    node = etree.SubElement(root, 'favoris')
    for row in repository.find_favoris(connection):
        etree.SubElement(node, 'favori', utilisateurId=str(row['utilisateur_id']),
                         logementId=str(row['logement_id']),
                         dateCreation=_datetime(row['date_creation']))

    node = etree.SubElement(root, 'reservations')
    for row in repository.find_reservations(connection):
        item = etree.SubElement(
            node, 'reservation', id=str(row['id']), logementId=str(row['logement_id']),
            demandeurId=str(row['demandeur_id']), statut=row['statut'],
            dateCreation=_datetime(row['date_creation']),
        )
        _fields(item, row, (('date_debut', 'dateDebut'), ('date_fin', 'dateFin'),
                            ('nombre_voyageurs', 'nombreVoyageurs'),
                            ('prix_nuit_centimes', 'prixNuitCentimes'),
                            ('montant_total_centimes', 'montantTotalCentimes')))

    lines = _group(repository.find_lignes(connection), 'facture_id')
    node = etree.SubElement(root, 'factures')
    for row in repository.find_factures(connection):
        item = etree.SubElement(
            node, 'facture', numero=row['numero'], reservationId=str(row['reservation_id']),
            dateEmission=_text(row['date_emission']), statut=row['statut'], devise=row['devise'],
        )
        _fields(item, row, (('total_centimes', 'totalCentimes'),
                            ('taux_commission', 'tauxCommissionPourcent'),
                            ('commission_centimes', 'commissionCentimes')))
        lines_node = etree.SubElement(item, 'lignes')
        for line in lines.get(row['id'], []):
            _fields(etree.SubElement(lines_node, 'ligne'), line,
                    (('libelle', 'libelle'), ('quantite', 'quantite'),
                     ('prix_unitaire_centimes', 'prixUnitaireCentimes'),
                     ('montant_centimes', 'montantCentimes')))

    try:
        _schema().assertValid(root)
    except etree.DocumentInvalid as error:
        raise ApiError("L'export XML de la base ne respecte pas son schéma.",
                       [{'message': str(error)}]) from error
    return root


def render_xml(connection):
    return etree.tostring(build_xml(connection), encoding='UTF-8',
                          xml_declaration=True, pretty_print=True)
