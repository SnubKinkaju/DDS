import json
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from src.api.integrations.geographie import ServiceIndisponible, lire_json, nombre
from src.api.services.import_lieux import EXTRAITS


COMMUNE = '74080'


def normaliser(data):
    daily = data['daily']
    dates, bas, haut = (daily[k] for k in ('time', 'temperature_2m_min', 'temperature_2m_max'))
    courant = data['current']
    if (
        data.get('timezone') != 'Europe/Paris'
        or data['current_units']['temperature_2m'] != '°C'
        or any(data['daily_units'][k] != '°C' for k in ('temperature_2m_min', 'temperature_2m_max'))
        or not nombre(courant['temperature_2m'])
        or not dates
        or len(dates) != len(bas)
        or len(bas) != len(haut)
    ):
        raise ValueError("Unités ou séries météo incohérentes.")
    instant = datetime.fromisoformat(courant['time'])
    jours = []
    for i, (jour, mini, maxi) in enumerate(zip(dates, bas, haut)):
        if i and date.fromisoformat(jour) != date.fromisoformat(dates[i - 1]) + timedelta(days=1):
            raise ValueError("Série de dates interrompue.")
        if not nombre(mini) or not nombre(maxi) or mini > maxi:
            raise ValueError("Températures invalides.")
        jours.append({'date': jour, 'min': mini, 'max': maxi})
    if instant.date().isoformat() not in dates:
        raise ValueError("Date météo incohérente.")
    return {
        'source': 'Open-Meteo',
        'sourceUrl': 'https://open-meteo.com/',
        'unite': '°C',
        'fuseau': 'Europe/Paris',
        'instant': courant['time'],
        'temperature': courant['temperature_2m'],
        'jours': jours,
    }


def prevision(db, archive=False):
    if archive:
        exemple = normaliser(json.loads((EXTRAITS / 'meteo-archive.json').read_text()))
        return {**exemple, 'etat': 'archive', 'recupereLe': None}
    now = datetime.now(timezone.utc)
    row = db.execute("SELECT * FROM cache_meteo WHERE commune=?", (COMMUNE,)).fetchone()
    age = now - datetime.fromisoformat(row['recupere_le']) if row else timedelta.max
    if row and age < timedelta(hours=1):
        return {**json.loads(row['contenu']), 'etat': 'actuel', 'recupereLe': row['recupere_le']}
    try:
        doc = normaliser(
            lire_json(
                'https://api.open-meteo.com/v1/forecast',
                {
                    'latitude': 45.905,
                    'longitude': 6.424,
                    'current': 'temperature_2m',
                    'daily': 'temperature_2m_min,temperature_2m_max',
                    'past_days': 2,
                    'forecast_days': 7,
                    'timezone': 'Europe/Paris',
                },
            )
        )
        if abs(
            now - datetime.fromisoformat(doc['instant']).replace(tzinfo=ZoneInfo('Europe/Paris'))
        ) > timedelta(hours=6):
            raise ValueError("Prévision trop ancienne.")
    except (ValueError, KeyError, TypeError, ServiceIndisponible):
        if row and age <= timedelta(hours=6):
            return {
                **json.loads(row['contenu']),
                'etat': 'dernier_succes',
                'recupereLe': row['recupere_le'],
            }
        raise ServiceIndisponible("La météo de La Clusaz est momentanément indisponible.") from None
    date_fetch = now.isoformat(timespec='seconds')
    with db:
        db.execute(
            """INSERT INTO cache_meteo VALUES (?,?,?) ON CONFLICT(commune) DO UPDATE SET
                      recupere_le=excluded.recupere_le,contenu=excluded.contenu""",
            (COMMUNE, date_fetch, json.dumps(doc)),
        )
    return {**doc, 'etat': 'actuel', 'recupereLe': date_fetch}
