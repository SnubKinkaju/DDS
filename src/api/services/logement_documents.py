"""Deux présentations XSLT et un graphe des lieux issus des mêmes documents validés."""
import json
from functools import lru_cache
from pathlib import Path

from lxml import etree

from src.api.validation import validate_json
from src.api.services.territoire import CATEGORIES


SRC = Path(__file__).resolve().parents[2]
TYPES_LIEUX = {'pharmacie': 'Pharmacy', 'lac': 'LakeBodyOfWater', 'transport': 'BusStop',
               'piscine': 'PublicSwimmingPool', 'alimentation': 'GroceryStore'}
OMBRE = {'non_renseigne': 'Non renseigné', 'aucun': 'Aucun', 'partiel': 'Partiel', 'important': 'Important'}


def geo(point):
    return {'@type': 'GeoCoordinates', 'latitude': point['latitude'], 'longitude': point['longitude']}


def graphe(logement, env, origin):
    identifiant = logement['id']
    fiche = f'{origin}/api/logements/{identifiant}/fiche.html'
    uri_logement = f'{origin}/logements/{identifiant}#logement'
    habitation = {'@id': uri_logement, '@type': 'Accommodation', 'name': logement['titre'],
                  'address': {'@type': 'PostalAddress', 'streetAddress': logement['adresse']['rue'],
                              'addressLocality': logement['adresse']['ville'], 'postalCode': logement['adresse']['codePostal']}}
    page = {'@id': fiche, '@type': 'WebPage', 'mainEntity': {'@id': uri_logement}}
    nodes = [page, habitation]
    if env['localisation']:
        habitation['geo'] = geo(env['localisation'])
        uri_liste = fiche + '#alentours'
        page['mentions'] = {'@id': uri_liste}
        entries = []
        nodes.append({'@id': uri_liste, '@type': 'ItemList', 'name': 'Lieux proches à vol d’oiseau',
                      'itemListElement': entries})
        for rang, lieu in enumerate(env['lieux'], 1):
            uri = f"{origin}/carte?lieu={lieu['id']}#lieu"
            entries.append({'@type': 'ListItem', 'position': rang,
                            'description': f"{lieu['distanceMetres']} m à vol d’oiseau du logement",
                            'item': {'@id': uri}})
            node = {'@id': uri, '@type': TYPES_LIEUX.get(lieu['categorie'], 'Place'), 'name': lieu['nom'],
                    'geo': geo(lieu)}
            if lieu['source'] == 'osm':
                node['sameAs'] = lieu['sourceUrl']
            nodes.append(node)
    return {'@context': 'https://schema.org', '@graph': nodes}


def projeter(parent, nom, valeur):
    if valeur is None:
        return
    node = etree.SubElement(parent, nom)
    if isinstance(valeur, dict):
        for cle, item in valeur.items():
            projeter(node, cle, item)
    elif isinstance(valeur, list):
        for item in valeur:
            projeter(node, 'item', item)
    else:
        node.text = str(valeur)


@lru_cache(maxsize=2)
def transformation(fmt):
    path = SRC / 'formats/xslt' / ('logement.xsl' if fmt == 'html' else 'logement-texte.xsl')
    return etree.XSLT(etree.parse(str(path)), access_control=etree.XSLTAccessControl.DENY_ALL)


def render_logement(document, env, format_name, origin):
    validate_json(env, 'environnement.schema.json')
    racine = etree.Element('fiche')
    projeter(racine, 'logement', document)
    projeter(racine, 'environnement', env)
    for node, lieu in zip(racine.xpath('environnement/lieux/item'), env['lieux']):
        node.set('libelle', CATEGORIES[lieu['categorie']])
    racine.set('ombre', OMBRE[document.get('ombrage', 'non_renseigne')])
    centimes = document['prixNuitCentimes']
    racine.set('prix', f'{centimes // 100},{centimes % 100:02d} €')
    params = {}
    if format_name == 'html':
        contenu = json.dumps(graphe(document, env, origin), ensure_ascii=False).replace('<', r'\u003c')
        params = {'graphe': etree.XSLT.strparam(contenu),
                  'css': etree.XSLT.strparam((SRC/'api/documents/fiche.css').read_text())}
    return bytes(transformation(format_name)(racine, **params))
