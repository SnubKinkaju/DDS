"""Accès HTTP bornés aux fournisseurs cartographiques et météo."""

import json
from datetime import datetime, timezone
from http.client import HTTPException
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
    except (HTTPException, URLError, OSError, ValueError) as error:
        raise ServiceIndisponible('Le fournisseur de données est indisponible.') from error


def nombre(value):
    return type(value) is int or (type(value) is float and isfinite(value))


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
    z = rows[0].get('z') if isinstance(rows, list) and rows and isinstance(rows[0], dict) else None
    return round(z) if nombre(z) and 0 < z < 5000 else None
