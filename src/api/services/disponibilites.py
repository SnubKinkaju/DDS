from datetime import date

from src.api.errors import ConflictError, ValidationError
from src.api.repositories.reservation_repository import find_booked_dates


def lire(db, logement_id):
    return [
        dict(r)
        for r in db.execute(
            """SELECT date_debut AS dateDebut, date_fin AS dateFin FROM disponibilite
        WHERE logement_id=? ORDER BY date_debut""",
            (logement_id,),
        )
    ]


def couvre(plages, debut, fin):
    return not plages or any(p['dateDebut'] <= debut and p['dateFin'] >= fin for p in plages)


def verifier(db, logement_id, debut, fin):
    if not couvre(lire(db, logement_id), debut, fin):
        raise ConflictError("Le logement n’est pas ouvert pendant toute cette période.")


def remplacer(db, logement_id, data, aujourd_hui):
    if (
        not isinstance(data, dict)
        or set(data) != {'periodes'}
        or not isinstance(data['periodes'], list)
        or len(data['periodes']) > 100
    ):
        raise ValidationError("Envoyez une liste de périodes (100 maximum).")
    periodes = []
    for p in data['periodes']:
        try:
            debut, fin = date.fromisoformat(p['dateDebut']), date.fromisoformat(p['dateFin'])
        except (KeyError, TypeError, ValueError):
            raise ValidationError("Saisissez les deux dates de chaque période.") from None
        if fin <= debut:
            raise ValidationError("La fin d’une période doit suivre son début.")
        periodes.append((debut.isoformat(), fin.isoformat()))
    fusion = []
    for debut, fin in sorted(periodes):
        if fusion and debut <= fusion[-1]['dateFin']:
            fusion[-1]['dateFin'] = max(fin, fusion[-1]['dateFin'])
        else:
            fusion.append({'dateDebut': debut, 'dateFin': fin})
    with db:
        db.execute('BEGIN IMMEDIATE')
        for sejour in find_booked_dates(db, logement_id, aujourd_hui):
            if not couvre(fusion, sejour['date_debut'], sejour['date_fin']):
                raise ConflictError("Un séjour accepté doit rester entièrement couvert.")
        db.execute('DELETE FROM disponibilite WHERE logement_id=?', (logement_id,))
        db.executemany(
            'INSERT INTO disponibilite(logement_id,date_debut,date_fin) VALUES (?,?,?)',
            [(logement_id, p['dateDebut'], p['dateFin']) for p in fusion],
        )
        attentes = db.execute(
            """SELECT date_debut,date_fin FROM reservation WHERE logement_id=?
            AND statut='en_attente' AND date_debut >= ?""",
            (logement_id, aujourd_hui),
        )
        affectees = sum(not couvre(fusion, r[0], r[1]) for r in attentes)
    return {'periodes': fusion, 'demandesHorsPeriode': affectees}
