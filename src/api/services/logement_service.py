from src.api.errors import AuthenticationError, NotFoundError, ValidationError
from src.api.repositories import logement_repository, utilisateur_repository, owner_repository
from src.api.validation import validate_json
from src.api.services.document_validation import validate_logement_document


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
    row = logement_repository.find_by_id(connection, logement_id)
    if row is None or row['statut'] != 'publie':
        raise NotFoundError("Le logement demandé n'existe pas.")

    document = serialize_detail(connection, row)
    validate_logement_document(document)
    return document


def serialize_detail(connection, row):
    logement_id = row['id']

    photos = logement_repository.find_photos(connection, logement_id)
    equipements = logement_repository.find_equipements(connection, logement_id)

    return {
        "id": row["id"],
        "statut": row["statut"],
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


def _required_text(value, field, minimum_length):
    normalized = value.strip()
    if len(normalized) < minimum_length:
        raise ValidationError(
            "Les données envoyées sont invalides.",
            [
                {
                    "champ": field,
                    "message": (
                        f"Ce champ doit contenir au moins {minimum_length} caractères."
                    ),
                }
            ],
        )
    return normalized


def create_published(connection, proprietaire_id, payload):
    validate_json(payload, "create-logement.schema.json")
    available = {row['id'] for row in owner_repository.list_equipment(connection)}
    if any(item not in available for item in payload.get('equipements', [])):
        raise ValidationError("Un équipement sélectionné n'existe pas.")

    utilisateur = utilisateur_repository.find_by_id(connection, proprietaire_id)
    if utilisateur is None:
        raise AuthenticationError("La session n'est plus valide.")

    adresse = payload["adresse"]
    titre = _required_text(payload["titre"], "titre", 3)
    description = _required_text(payload["description"], "description", 10)
    rue = _required_text(adresse["rue"], "adresse.rue", 3)

    try:
        adresse_id = logement_repository.create_address(
            connection,
            rue,
            adresse["codePostal"],
            adresse["ville"],
        )
        logement_id = logement_repository.create_logement(
            connection,
            proprietaire_id,
            adresse_id,
            titre,
            description,
            payload["typeLogement"],
            payload["capacite"],
            payload["prixNuitCentimes"],
        )
        utilisateur_repository.promote_to_owner(connection, proprietaire_id)
        owner_repository.replace_equipment(connection, logement_id, payload.get('equipements', []))
        connection.commit()
    except Exception:
        connection.rollback()
        raise

    return get_published(connection, logement_id)
