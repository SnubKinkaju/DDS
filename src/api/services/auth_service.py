import sqlite3

from werkzeug.security import check_password_hash, generate_password_hash

from src.api.errors import AuthenticationError, ConflictError, ValidationError
from src.api.repositories import utilisateur_repository
from src.api.validation import validate_json


def _serialize_utilisateur(row):
    return {
        "id": row["id"],
        "prenom": row["prenom"],
        "nom": row["nom"],
        "email": row["email"],
        "telephone": row["telephone"],
        "role": row["role"],
        "dateCreation": row["date_creation"],
    }


def _required_text(value, field):
    normalized = value.strip()
    if not normalized:
        raise ValidationError(
            "Les données envoyées sont invalides.",
            [{"champ": field, "message": "Ce champ ne peut pas être vide."}],
        )
    return normalized


def register(connection, payload):
    validate_json(payload, "register.schema.json")

    prenom = _required_text(payload["prenom"], "prenom")
    nom = _required_text(payload["nom"], "nom")
    email = payload["email"].strip().lower()
    telephone = payload.get("telephone")
    telephone = telephone.strip() if telephone and telephone.strip() else None

    if utilisateur_repository.find_by_email(connection, email):
        raise ConflictError("Un compte existe déjà avec cette adresse email.")

    password_hash = generate_password_hash(payload["motDePasse"])

    try:
        utilisateur = utilisateur_repository.create(
            connection,
            prenom,
            nom,
            email,
            password_hash,
            telephone,
        )
    except sqlite3.IntegrityError as error:
        connection.rollback()
        raise ConflictError(
            "Un compte existe déjà avec cette adresse email."
        ) from error

    return _serialize_utilisateur(utilisateur)


def login(connection, payload):
    validate_json(payload, "login.schema.json")

    email = payload["email"].strip().lower()
    utilisateur = utilisateur_repository.find_by_email(connection, email)

    if utilisateur is None or not check_password_hash(
        utilisateur["mot_de_passe_hash"], payload["motDePasse"]
    ):
        raise AuthenticationError("Email ou mot de passe incorrect.")

    return _serialize_utilisateur(utilisateur)


def get_current_user(connection, utilisateur_id):
    utilisateur = utilisateur_repository.find_by_id(connection, utilisateur_id)
    if utilisateur is None:
        raise AuthenticationError("La session n'est plus valide.")
    return _serialize_utilisateur(utilisateur)
