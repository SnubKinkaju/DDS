"""Catalogue commun et calcul des proximités pour une adresse confirmée."""

from math import asin, cos, radians, sin, sqrt

from src.api.errors import NotFoundError
from src.api.repositories.logement_repository import find_equipements
from src.api.integrations.geographie import nombre


CATEGORIES = {
    'eau': "Eau potable",
    'pharmacie': "Pharmacie",
    'transport': "Arrêt de bus",
    'lac': "Lac",
    'piscine': "Piscine",
    'alimentation': "Commerce alimentaire",
    'lieu_frais': "Lieu de fraîcheur",
}
EMPRISE = (45.835, 6.36, 45.959, 6.565)
RAYON = 2000


def dans_emprise(lat, lon):
    sud, ouest, nord, est = EMPRISE
    return nombre(lat) and nombre(lon) and sud <= lat <= nord and ouest <= lon <= est


def distance(lat1, lon1, lat2, lon2):
    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)
    a = sin(delta_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(delta_lon / 2) ** 2
    return 6371000 * 2 * asin(sqrt(min(1, a)))


def lieu(row):
    return {
        'id': row['id'],
        'nom': row['nom'] or CATEGORIES[row['categorie']],
        'categorie': row['categorie'],
        'latitude': row['latitude'],
        'longitude': row['longitude'],
        'position': row['position'],
        'acces': row['acces'],
        'source': row['source'],
        'sourceUrl': row['url'],
        'collecteLe': row['collecte_le'],
        'verifieLe': row['verifie_le'],
    }


def lieux_publics(db):
    return [
        lieu(row)
        for row in db.execute("""
        SELECT * FROM point_interet WHERE actif=1 AND acces != 'restreint' ORDER BY categorie, nom, id
    """)
    ]


def environnement(db, logement_id):
    row = db.execute(
        """
        SELECT l.id, l.ombrage, p.* FROM logement_public l LEFT JOIN localisation_logement p ON p.logement_id=l.id
        WHERE l.id=?
    """,
        (logement_id,),
    ).fetchone()
    if row is None:
        raise NotFoundError("Ce logement n’est pas disponible.")
    source = db.execute("SELECT succes_le FROM import_territoire WHERE source='osm'").fetchone()
    document = {
        'protections': {
            'ombrage': row['ombrage'],
            'equipements': [
                e['nom']
                for e in find_equipements(db, logement_id)
                if e['nom'] in ('Volets', 'Ventilateur', 'Climatisation', 'Aération traversante')
            ],
        },
        'localisation': None,
        'rayonMetres': RAYON,
        'importLe': source[0] if source else None,
        'lieux': [],
    }
    if row['adresse_ign'] is None:
        return document
    document['localisation'] = {
        'latitude': row['latitude'],
        'longitude': row['longitude'],
        'adresseIgn': row['adresse_ign'],
        'verifieLe': row['verifie_le'],
        'altitudeMetres': row['altitude'],
        'altitudeLe': row['altitude_le'],
    }
    candidats = []
    for item in lieux_publics(db):
        metres = distance(row['latitude'], row['longitude'], item['latitude'], item['longitude'])
        if metres <= RAYON:
            candidats.append({**item, 'distanceMetres': round(metres)})
    compte = {}
    for item in sorted(candidats, key=lambda p: (p['distanceMetres'], p['id'])):
        cle = item['categorie']
        if compte.get(cle, 0) < 3:
            document['lieux'].append(item)
            compte[cle] = compte.get(cle, 0) + 1
    return document


def carte(db):
    points = []

    def ajouter(famille, identifiant, lon, lat, props):
        points.append(
            {
                'type': 'Feature',
                'id': f'{famille}-{identifiant}',
                'geometry': {'type': 'Point', 'coordinates': [lon, lat]},
                'properties': {'famille': famille, 'id': identifiant, **props},
            }
        )

    for row in db.execute("""SELECT l.id,l.titre,p.longitude,p.latitude FROM logement_public l
                             JOIN localisation_logement p ON p.logement_id=l.id ORDER BY l.id"""):
        ajouter(
            'logement',
            row['id'],
            row['longitude'],
            row['latitude'],
            {'nom': row['titre'], 'url': f"/logements/{row['id']}"},
        )
    for item in lieux_publics(db):
        ajouter(
            'lieu',
            item['id'],
            item['longitude'],
            item['latitude'],
            {k: item[k] for k in ('nom', 'categorie', 'acces', 'sourceUrl', 'position')},
        )
    return {'type': 'FeatureCollection', 'features': points}
