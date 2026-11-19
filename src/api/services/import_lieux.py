import json
from datetime import datetime
from pathlib import Path

from src.api.integrations.geographie import ServiceIndisponible, lire_json, maintenant
from src.api.services.territoire import EMPRISE, dans_emprise, distance


EXTRAITS = Path(__file__).resolve().parents[2] / 'db/seeds/territoire'
REQUETE = f'''[out:json][timeout:25][bbox:{','.join(map(str, EMPRISE))}];
(nwr[amenity~"^(drinking_water|pharmacy)$"];nwr[drinking_water=yes];nwr[highway=bus_stop];
nwr[leisure~"^(swimming_pool|water_park)$"];nwr[natural=water][water=lake];
nwr[shop~"^(supermarket|convenience|bakery)$"];nwr[public_transport=platform][bus=yes];
nwr[sport=swimming][leisure=sports_centre];);out center;'''


def categorie(tags, identifiant):
    if tags.get('access') in ('private', 'no') or tags.get('disused') == 'yes':
        return None
    if tags.get('drinking_water') == 'yes' or (
        tags.get('amenity') == 'drinking_water' and tags.get('drinking_water') != 'no'
    ):
        return 'eau'
    if tags.get('amenity') == 'pharmacy':
        return 'pharmacie'
    if tags.get('highway') == 'bus_stop' or (
        tags.get('public_transport') == 'platform' and tags.get('bus') == 'yes'
    ):
        return 'transport'
    if tags.get('natural') == 'water' and tags.get('water') == 'lake':
        return 'lac'
    if tags.get('shop') in ('supermarket', 'convenience', 'bakery'):
        return 'alimentation'
    # Établissement avec billetterie publique confirmé par l'office de tourisme.
    if identifiant == 'way/1526189735':
        return 'piscine'
    if tags.get('access') in ('yes', 'public', 'permissive') and (
        tags.get('leisure') in ('swimming_pool', 'water_park') or tags.get('sport') == 'swimming'
    ):
        return 'piscine'
    return None


def normaliser(document):
    if document.get('remark') or not isinstance(document.get('elements'), list):
        raise ValueError("Extraction OSM incomplète.")
    date = document['osm3s']['timestamp_osm_base']
    datetime.fromisoformat(date.replace('Z', '+00:00'))
    resultats = []
    for obj in document['elements']:
        identifiant = f"{obj['type']}/{obj['id']}"
        tags = obj.get('tags', {})
        cat = categorie(tags, identifiant)
        pos = obj.get('center', obj)
        lat, lon = pos.get('lat'), pos.get('lon')
        if not cat or not dans_emprise(lat, lon):
            continue
        acces = (
            'public'
            if tags.get('access') in ('yes', 'public', 'permissive') or cat == 'piscine'
            else 'inconnu'
        )
        resultats.append(
            (
                identifiant,
                cat,
                tags.get('name'),
                lat,
                lon,
                'centre' if 'center' in obj else 'point',
                acces,
                'https://www.openstreetmap.org/' + identifiant,
                date,
            )
        )

    uniques = []
    for lieu in sorted(resultats):
        identifiant, cat, nom, lat, lon = lieu[:5]
        # Une plate-forme peut aussi être cartographiée par un nœud au même emplacement.
        if (
            cat == 'transport'
            and nom
            and any(
                autre[1:3] == (cat, nom) and distance(lat, lon, autre[3], autre[4]) < 20
                for autre in uniques
            )
        ):
            continue
        uniques.append(lieu)
    if not uniques:
        raise ValueError("Aucun lieu exploitable. Le catalogue précédent est conservé.")
    return uniques, date


def importer(db, extrait=None):
    tentative = maintenant()
    try:
        document = (
            json.loads(Path(extrait).read_text())
            if extrait
            else lire_json(
                'https://overpass-api.de/api/interpreter',
                {'data': REQUETE},
                timeout=40,
                maximum=8_000_000,
            )
        )
        rows, date = normaliser(document)
        with db:
            db.execute('BEGIN IMMEDIATE')
            ancien = db.execute(
                "SELECT volume,succes_le FROM import_territoire WHERE source='osm'"
            ).fetchone()
            if (
                ancien
                and ancien['volume']
                and (len(rows) < ancien['volume'] / 2 or date < ancien['succes_le'])
            ):
                raise ValueError("Extrait trop ancien ou couverture anormalement basse.")
            db.execute("UPDATE point_interet SET actif=0 WHERE source='osm'")
            db.executemany(
                """
                INSERT INTO point_interet(source, identifiant,categorie,nom,latitude,longitude,position,acces,url,collecte_le)
                VALUES ('osm',?,?,?,?,?,?,?,?,?)
                ON CONFLICT(source,identifiant) DO UPDATE SET categorie=excluded.categorie,nom=excluded.nom,
                latitude=excluded.latitude,longitude=excluded.longitude,position=excluded.position,acces=excluded.acces,
                url=excluded.url,collecte_le=excluded.collecte_le,actif=1
            """,
                rows,
            )
            db.execute(
                """INSERT INTO import_territoire(source,tentative_le,succes_le,resultat,volume)
                          VALUES ('osm',?,?,'ok',?) ON CONFLICT(source) DO UPDATE SET
                          tentative_le=excluded.tentative_le,succes_le=excluded.succes_le,resultat='ok',volume=excluded.volume""",
                (tentative, date, len(rows)),
            )
        return len(rows)
    except (ValueError, KeyError, TypeError, OSError, ServiceIndisponible) as error:
        with db:
            db.execute(
                """INSERT INTO import_territoire(source,tentative_le,resultat) VALUES ('osm',?,'erreur')
                          ON CONFLICT(source) DO UPDATE SET tentative_le=excluded.tentative_le,resultat='erreur'""",
                (tentative,),
            )
        raise ValueError("Import impossible. Le dernier catalogue est conservé.") from error
