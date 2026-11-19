"""Accès HTTP bornés aux fournisseurs cartographiques et météo."""

import json
from datetime import datetime, timezone
from math import isfinite
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from src.api.errors import ApiError


class ServiceIndisponible(ApiError):
    status_code = 503
    code = 'source_indisponible'


def maintenant():
    return datetime.now(timezone.utc).isoformat(timespec='seconds')


def lire_json(url, params, *, timeout=5, maximum=1_000_000):
    request = Request(
        url + '?' + urlencode(params),
        headers={
            'Accept': 'application/json',
            'User-Agent': 'Refuge-climatique-La-Clusaz/1.0 (projet universitaire)',
        },
    )
    try:
        with urlopen(request, timeout=timeout) as response:
            contenu = response.read(maximum + 1)
        if len(contenu) > maximum:
            raise ValueError('Réponse trop grande.')
        document = json.loads(contenu)
        if not isinstance(document, dict):
            raise ValueError('Document inattendu.')
        return document
    except (TimeoutError, URLError, OSError, ValueError) as error:
        raise ServiceIndisponible('Le fournisseur de données est indisponible.') from error


def nombre(value):
    return type(value) in (int, float) and isfinite(value)


def adresses(texte):
    response = lire_json(
        'https://data.geopf.fr/geocodage/search',
        {
            'q': texte,
            'index': 'address',
            'citycode': '74080',
            'limit': 5,
        },
    )
    resultats = []
    if not isinstance(response.get('features'), list):
        raise ServiceIndisponible("Réponse d’adresses illisible.")
    for feature in response['features']:
        props = feature.get('properties', {})
        if (
            props.get('type') != 'housenumber'
            or props.get('citycode') != '74080'
            or props.get('postcode') != '74220'
            or not props.get('id')
            or not props.get('name')
        ):
            continue
        coords = feature.get('geometry', {}).get('coordinates', [])
        if len(coords) != 2 or not all(map(nombre, coords)):
            continue
        lon, lat = coords
        if not (6.34 < lon < 6.60 and 45.81 < lat < 45.99):
            continue
        resultats.append({'id': props['id'], 'rue': props['name'], 'longitude': lon, 'latitude': lat})
    return resultats


def altitude(lon, lat):
    data = lire_json(
        'https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json',
        {
            'lon': lon,
            'lat': lat,
            'resource': 'ign_rge_alti_wld',
        },
    )
    rows = data.get('elevations') or []
    z = rows[0].get('z') if rows and isinstance(rows[0], dict) else None
    return round(z) if nombre(z) and 0 < z < 5000 else None
