"""Une facture validée, puis XML → XSD → XSLT (HTML ou texte)."""
from functools import lru_cache
from pathlib import Path

from lxml import etree

from src.api.errors import ApiError
from src.api.services.facture_validation import validate_document


FORMATS_DIR = Path(__file__).resolve().parents[2] / 'formats'
STYLES_PATH = Path(__file__).resolve().parents[1] / 'documents/facture.css'


def _fields(parent, data, names):
    for name in names:
        if data[name] is not None:
            etree.SubElement(parent, name).text = str(data[name])


def _address(parent, address):
    if address is not None:
        _fields(etree.SubElement(parent, 'adresse'), address, ('rue', 'codePostal', 'ville'))


@lru_cache(maxsize=1)
def _schema():
    return etree.XMLSchema(etree.parse(str(FORMATS_DIR / 'xml/facture.xsd')))


@lru_cache(maxsize=2)
def _transform(format_name):
    filename = 'facture.xsl' if format_name == 'html' else 'facture-texte.xsl'
    return etree.XSLT(
        etree.parse(str(FORMATS_DIR / 'xslt' / filename)),
        access_control=etree.XSLTAccessControl.DENY_ALL,
    )


def build_xml(document):
    validate_document(document)
    root = etree.Element('facture', **{
        key: document[key] for key in ('numero', 'dateEmission', 'statut', 'devise')
    })
    for role in ('emetteur', 'client'):
        person = document[role]
        node = etree.SubElement(root, role, id=str(person['id']))
        _fields(node, person, ('prenom', 'nom', 'email', 'telephone'))
        _address(node, person['adresse'])
    listing = document['logement']
    node = etree.SubElement(root, 'logement', id=str(listing['id']))
    _fields(node, listing, ('titre', 'typeLogement'))
    _address(node, listing['adresse'])
    stay = document['sejour']
    node = etree.SubElement(root, 'sejour', reservationId=str(stay['reservationId']))
    _fields(node, stay, ('dateDebut', 'dateFin', 'nombreNuits', 'nombreVoyageurs', 'prixNuitCentimes'))
    lines = etree.SubElement(root, 'lignes')
    for line in document['lignes']:
        _fields(etree.SubElement(lines, 'ligne'), line,
                ('libelle', 'quantite', 'prixUnitaireCentimes', 'montantCentimes'))
    commission = etree.SubElement(root, 'commission', incluseDansTotal='true', aLaChargeDe='emetteur')
    _fields(commission, document['commission'], ('tauxPourcent', 'montantCentimes'))
    _fields(root, document, ('totalCentimes', 'netEmetteurCentimes'))
    try:
        _schema().assertValid(root)
    except etree.DocumentInvalid as error:
        raise ApiError('Le document XML de la facture ne respecte pas son schéma.') from error
    return root


def render_document(document, format_name):
    if format_name not in ('xml', 'html', 'txt'):
        raise ValueError('Format de facture inconnu.')
    xml = build_xml(document)
    if format_name == 'xml':
        return etree.tostring(xml, encoding='UTF-8', xml_declaration=True, pretty_print=True)
    params = {'styles': etree.XSLT.strparam(STYLES_PATH.read_text(encoding='utf-8'))} if format_name == 'html' else {}
    return bytes(_transform(format_name)(xml, **params))
