from src.api.errors import ValidationError
from src.api.integrations import geographie


def verifier(payload):
    identifiant = payload.get('adresseIgn')
    if not identifiant:
        return None
    rue = payload['adresse']['rue'].strip()
    try:
        suggestions = geographie.adresses(rue)
    except geographie.ServiceIndisponible:
        return None
    adresse = next((x for x in suggestions if x['id'] == identifiant and x['rue'] == rue), None)
    if adresse is None:
        raise ValidationError(
            "L’adresse sélectionnée a changé. Choisissez une suggestion de La Clusaz."
        )
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
            altitude=excluded.altitude, altitude_le=excluded.altitude_le
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
