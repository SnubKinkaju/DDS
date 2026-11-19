"""Vérifier les documents des quatre rendus sur la base fictive, en lecture seule."""

import argparse
import json
import sqlite3
from contextlib import closing
from copy import deepcopy
from pathlib import Path

from lxml import etree, html
from flask import render_template

from src.api.app import app
from src.api.repositories.utilisateur_repository import find_public_profile

from src.api.services import export_service, facture_documents, facture_service
from src.api.services import logement_documents, logement_service, territoire
from src.api.validation import get_validator

FORMATS = Path(__file__).resolve().parents[2] / 'formats'


def verifier(condition, detail):
    if not condition:
        raise ValueError(detail)


def exemples_json():
    for fichier, schema, attendu in (
        ('creation-logement.json', 'create-logement.schema.json', True),
        ('logement.json', 'logement.schema.json', True),
        ('logement-invalide.json', 'logement.schema.json', False),
    ):
        document = json.loads((FORMATS / 'examples' / fichier).read_bytes())
        valide = get_validator(schema).is_valid(document)
        verifier(valide == attendu, f'{fichier} : résultat de validation inattendu')
    print('JSON Schema · deux exemples acceptés et prix négatif refusé.')


def verifier_exports(db):
    base = export_service.build_xml(db)
    collection = etree.fromstring(
        facture_documents.collection_xml(db), etree.XMLParser(remove_blank_text=True)
    )
    factures = list(db.execute('SELECT * FROM facture ORDER BY numero'))
    verifier(factures and len(collection) == len(factures), 'Collection de démonstration incomplète')
    dtd = etree.DTD(str(FORMATS / 'xml/facture.dtd'))
    for noeud, ligne in zip(collection, factures):
        document = facture_service.serialize(db, ligne)
        facture = facture_documents.build_xml(document)
        dtd.assertValid(noeud)
        verifier(etree.tostring(facture) == etree.tostring(noeud), 'Écart avec la facture unitaire')
    for fmt in ('html', 'txt'):
        rendu = facture_documents.render_document(document, fmt).decode()
        verifier(document['numero'] in rendu, f'Numéro absent du rendu {fmt}')
    copie = deepcopy(collection[0])
    copie.set('dateEmission', 'date-invalide')
    schema = etree.XMLSchema(etree.parse(str(FORMATS / 'xml/facture.xsd')))
    verifier(dtd.validate(copie) and not schema.validate(copie), 'Contrôle du type date')
    copie.remove(copie.find('client'))
    verifier(not dtd.validate(copie), 'La structure devrait exiger le client')
    for expression, requete in (
        ('count(/baseDeDonnees/logements/logement)', 'SELECT count(*) FROM logement'),
        (
            'count(/baseDeDonnees/lieux/lieu[@categorie="pharmacie" and @actif="true"])',
            "SELECT count(*) FROM point_interet WHERE categorie='pharmacie' AND actif=1",
        ),
        (
            'sum(/baseDeDonnees/factures/facture[@statut="emise"]/totalCentimes)',
            "SELECT coalesce(sum(total_centimes),0) FROM facture WHERE statut='emise'",
        ),
    ):
        valeur = int(base.xpath(expression))
        verifier(valeur == db.execute(requete).fetchone()[0], expression)
        print(f'XPath · {expression} = {valeur}')
    numeros = collection.xpath("/factures/facture[client/nom='Dupont']/@numero")
    attendus = [
        r['numero'] for r in factures if json.loads(r['contexte_json'])['client']['nom'] == 'Dupont'
    ]
    verifier(numeros == attendus, 'Filtre XPath sur le client figé')
    copie = deepcopy(base)
    copie.find('logements/logement').set('proprietaireId', '999999999')
    schema_base = etree.XMLSchema(etree.parse(str(FORMATS / 'xml/base_de_donnees.xsd')))
    verifier(
        not schema_base.validate(copie), 'La référence vers le propriétaire devrait être refusée'
    )
    print(f'{len(collection)} factures · DTD, XSD, rendus XSLT, collection et références contrôlés.')


def verifier_lieux(db):
    points = {f['id']: f for f in territoire.carte(db)['features']}
    logements = db.execute('''SELECT l.id FROM logement_public l
        JOIN localisation_logement p ON p.logement_id=l.id ORDER BY l.id''').fetchall()
    verifier(
        len(logements) >= 2, 'Deux annonces géolocalisées sont requises pour cette démonstration'
    )
    for (identifiant,) in logements:
        document = logement_service.get_published(db, identifiant)
        env = territoire.environnement(db, identifiant)
        origine = 'https://refuge.example'
        fiche = html.fromstring(logement_documents.render_logement(document, env, 'html', origine))
        texte = logement_documents.render_logement(document, env, 'txt', origine).decode()
        graphe = json.loads(fiche.xpath('//script[@type="application/ld+json"]/text()')[0])
        liste = next(n for n in graphe['@graph'] if n['@type'] == 'ItemList')
        noeuds = {n['@id']: n for n in graphe['@graph']}
        verifier(len(liste['itemListElement']) == len(env['lieux']), 'Nombre de lieux incohérent')
        for entree, lieu in zip(liste['itemListElement'], env['lieux']):
            lien = f"/carte?lieu={lieu['id']}"
            noeud = noeuds[entree['item']['@id']]
            point = points[f"lieu-{lieu['id']}"]
            verifier(
                entree['item']['@id'] == origine + lien + '#lieu'
                and point['geometry']['coordinates'] == [lieu['longitude'], lieu['latitude']]
                and noeud['name'] == lieu['nom']
                and lieu['nom'] in texte
                and lieu['nom'] in fiche.xpath('//a[@href=$url]/text()', url=lien)
                and str(lieu['distanceMetres']) in entree['description'],
                'Écart entre carte, JSON-LD et fiche',
            )
    print(f'{len(logements)} fiches géolocalisées · mêmes lieux en HTML, texte, GeoJSON et JSON-LD.')


def verifier_profil(db):
    proprietaire = db.execute(
        'SELECT proprietaire_id FROM logement_public ORDER BY id LIMIT 1'
    ).fetchone()[0]
    personne = find_public_profile(db, proprietaire)
    with app.test_request_context():
        profil = html.fromstring(render_template('utilisateur.html', utilisateur=personne))
    (sujet,) = profil.xpath('//*[@vocab="https://schema.org/" and @typeof="Person"]')
    for prop, colonne in (('givenName', 'prenom'), ('familyName', 'nom'), ('email', 'email')):
        valeur = sujet.xpath('string(.//*[@property=$nom])', nom=prop)
        verifier(valeur.strip() == personne[colonne], f'Le profil RDFa doit restituer {prop}')
    print('RDFa · prénom, nom et email du profil correspondent au propriétaire en base.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--database', type=Path, default=Path('instance/demo/refuge.sqlite3'))
    args = parser.parse_args()
    exemples_json()
    with closing(sqlite3.connect(args.database.resolve().as_uri() + '?mode=ro', uri=True)) as db:
        db.row_factory = sqlite3.Row
        db.execute('BEGIN')
        verifier_exports(db)
        verifier_lieux(db)
        verifier_profil(db)


if __name__ == '__main__':
    main()
