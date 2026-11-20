from src.api.errors import ValidationError
from src.api.integrations import geographie
from src.api.services import adresses


def verifier(db, payload, actuelle=None):
    """Vérifie l'adresse choisie et fixe son libellé officiel dans le payload.

    Seule une adresse du référentiel de La Clusaz est acceptée. Retourne la
    position à enregistrer, ou None si le logement garde la même adresse (il est
    alors inutile de redemander l'altitude à l'IGN).
    """
    adresse = adresses.trouver(db, payload.get('adresseIgn'))
    if adresse is None:
        raise ValidationError(
            "Choisissez une adresse de La Clusaz dans la liste proposée.",
            [{"champ": "adresse.rue", "message": "Adresse absente du référentiel de La Clusaz."}],
        )
    payload['adresse']['rue'] = adresse['rue']
    if adresse['id'] == actuelle:
        return None
    try:
        z = geographie.altitude(adresse['longitude'], adresse['latitude'])
    except geographie.ServiceIndisponible:
        z = None
    return {**adresse, 'altitude': z, 'verifieLe': geographie.maintenant()}


def enregistrer(db, logement_id, position):
    date = position['verifieLe']
    db.execute(
        """
        INSERT INTO localisation_logement(logement_id, adresse_ign, longitude, latitude, verifie_le, altitude, altitude_le)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(logement_id) DO UPDATE SET adresse_ign=excluded.adresse_ign,
            longitude=excluded.longitude, latitude=excluded.latitude, verifie_le=excluded.verifie_le,
            altitude=CASE WHEN excluded.altitude IS NULL AND longitude=excluded.longitude
                     AND latitude=excluded.latitude THEN altitude ELSE excluded.altitude END,
            altitude_le=CASE WHEN excluded.altitude IS NULL AND longitude=excluded.longitude
                     AND latitude=excluded.latitude THEN altitude_le ELSE excluded.altitude_le END
    """,
        (
            logement_id,
            position['id'],
            position['longitude'],
            position['latitude'],
            date,
            position['altitude'],
            date if position['altitude'] is not None else None,
        ),
    )
