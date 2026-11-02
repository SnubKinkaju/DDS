from flask import Blueprint, jsonify, request, session

from src.api.errors import AuthenticationError
from src.api.services import auth_service
from src.db.flask import get_db


auth_blueprint = Blueprint("auth", __name__, url_prefix="/api/auth")


def _open_session(utilisateur):
    session.clear()
    session["utilisateur_id"] = utilisateur["id"]
    session.permanent = True


@auth_blueprint.post("/inscription")
def register():
    utilisateur = auth_service.register(get_db(), request.get_json(silent=True))
    _open_session(utilisateur)
    return jsonify(utilisateur=utilisateur), 201


@auth_blueprint.post("/connexion")
def login():
    utilisateur = auth_service.login(get_db(), request.get_json(silent=True))
    _open_session(utilisateur)
    return jsonify(utilisateur=utilisateur)


@auth_blueprint.post("/deconnexion")
def logout():
    session.clear()
    return jsonify(message="Déconnexion réussie.")


@auth_blueprint.get("/moi")
def get_current_user():
    utilisateur_id = session.get("utilisateur_id")
    if utilisateur_id is None:
        raise AuthenticationError("Vous devez être connecté.")

    utilisateur = auth_service.get_current_user(get_db(), utilisateur_id)
    return jsonify(utilisateur=utilisateur)
