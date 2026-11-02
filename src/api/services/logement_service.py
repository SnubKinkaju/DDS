from src.api.errors import NotFoundError
from src.api.repositories import logement_repository


def _serialize_address(row):
    return {
        "rue": row["rue"],
        "codePostal": row["code_postal"],
        "ville": row["ville"],
    }


def list_published(connection):
    rows = logement_repository.find_published(connection)

    logements = [
        {
            "id": row["id"],
            "titre": row["titre"],
            "description": row["description"],
            "typeLogement": row["type_logement"],
            "capacite": row["capacite"],
            "prixNuitCentimes": row["prix_nuit_centimes"],
            "adresse": _serialize_address(row),
            "photoPrincipale": row["photo_principale"],
        }
        for row in rows
    ]

    return {
        "logements": logements,
        "total": len(logements),
    }


def get_published(connection, logement_id):
    row = logement_repository.find_published_by_id(connection, logement_id)
    if row is None:
        raise NotFoundError("Le logement demandé n'existe pas.")

    photos = logement_repository.find_photos(connection, logement_id)
    equipements = logement_repository.find_equipements(connection, logement_id)

    return {
        "id": row["id"],
        "titre": row["titre"],
        "description": row["description"],
        "typeLogement": row["type_logement"],
        "capacite": row["capacite"],
        "prixNuitCentimes": row["prix_nuit_centimes"],
        "adresse": _serialize_address(row),
        "proprietaire": {
            "id": row["proprietaire_id"],
            "prenom": row["proprietaire_prenom"],
            "nom": row["proprietaire_nom"],
        },
        "photos": [
            {
                "id": photo["id"],
                "url": photo["url"],
                "position": photo["position"],
            }
            for photo in photos
        ],
        "equipements": [
            {
                "id": equipement["id"],
                "nom": equipement["nom"],
            }
            for equipement in equipements
        ],
    }
