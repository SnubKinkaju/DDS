from urllib.parse import urlsplit
from uuid import uuid4

from src.api.errors import NotFoundError, ValidationError
from src.api.integrations.geographie import maintenant
from src.api.services.territoire import CATEGORIES, dans_emprise, lieu


def bilan(db):
    collecte = db.execute("SELECT * FROM import_territoire WHERE source='osm'").fetchone()
    counts = {
        row['categorie']: dict(row)
        for row in db.execute("""
        SELECT categorie, COUNT(*) AS total, SUM(acces='public') AS confirmes,
        SUM(acces='inconnu') AS inconnus, MAX(verifie_le) AS derniereVerification FROM point_interet WHERE actif=1 GROUP BY categorie
    """)
    }
    return {
        'import': dict(collecte) if collecte else None,
        'categories': [
            {'code': k, 'nom': nom, **counts.get(k, {'total': 0, 'confirmes': 0, 'inconnus': 0})}
            for k, nom in CATEGORIES.items()
        ],
        'accesAConfirmer': [
            dict(row)
            for row in db.execute("""
                SELECT id, categorie, COALESCE(nom, identifiant) AS nom, url, collecte_le AS collecteLe
                FROM point_interet WHERE actif=1 AND acces='inconnu' ORDER BY categorie,nom,id
            """)
        ],
        'lieuxMunicipaux': [
            lieu(row)
            for row in db.execute(
                "SELECT * FROM point_interet WHERE source='mairie' AND actif=1 ORDER BY nom"
            )
        ],
    }


def enregistrer(db, auteur, data, identifiant=None):
    if not isinstance(data, dict):
        raise ValidationError("Une description du lieu est requise.")
    nom = data.get('nom')
    url = data.get('sourceUrl')
    cat, acces = data.get('categorie'), data.get('acces')
    lat, lon = data.get('latitude'), data.get('longitude')
    if not isinstance(nom, str) or not 1 <= len(nom.strip()) <= 160:
        raise ValidationError("Indiquez le nom du lieu (160 caractères maximum).")
    if not isinstance(url, str) or len(url) > 1500 or not url.startswith(('https://', 'http://')):
        raise ValidationError("Indiquez la page publique qui décrit le lieu.")
    try:
        host = urlsplit(url).hostname
    except ValueError:
        host = None
    if (
        not host
        or not isinstance(cat, str)
        or cat not in CATEGORIES
        or acces not in ('public', 'inconnu', 'restreint')
    ):
        raise ValidationError("Vérifiez la source, la catégorie et l’accès.")
    if cat in ('piscine', 'lieu_frais') and acces == 'inconnu':
        raise ValidationError("Confirmez l’accès public ou indiquez que ce lieu est restreint.")
    if not dans_emprise(lat, lon):
        raise ValidationError(
            "Le lieu doit être situé sur le territoire de La Clusaz ou de ses abords."
        )
    date = maintenant()
    with db:
        if identifiant is None:
            return db.execute(
                """INSERT INTO point_interet(source,identifiant,categorie,nom,latitude,longitude,
                position,acces,url,collecte_le,verifie_le,auteur_id) VALUES ('mairie',?,?,?,?,?,'point',?,?,?,?,?)""",
                (str(uuid4()), cat, nom.strip(), lat, lon, acces, url, date, date, auteur),
            ).lastrowid
        cursor = db.execute(
            """UPDATE point_interet SET categorie=?,nom=?,latitude=?,longitude=?,acces=?,url=?,
            verifie_le=?,auteur_id=? WHERE id=? AND source='mairie' AND actif=1""",
            (cat, nom.strip(), lat, lon, acces, url, date, auteur, identifiant),
        )
        if not cursor.rowcount:
            raise NotFoundError("Lieu municipal introuvable.")
    return identifiant


def retirer(db, identifiant, auteur):
    with db:
        if not db.execute(
            """UPDATE point_interet SET actif=0,verifie_le=?,auteur_id=?
                             WHERE id=? AND actif=1 AND source='mairie'""",
            (maintenant(), auteur, identifiant),
        ).rowcount:
            raise NotFoundError("Lieu municipal introuvable.")
