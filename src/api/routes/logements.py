from flask import Blueprint, jsonify, request, session

from src.api.errors import AuthenticationError
from src.api.repositories import owner_repository
from src.api.services import logement_service
from src.db.flask import get_db


logements_blueprint = Blueprint(
    "logements",
    __name__,
    url_prefix="/api/logements",
)


@logements_blueprint.get("")
def list_logements():
    return jsonify(logement_service.list_published(get_db()))


@logements_blueprint.post("")
def create_logement():
    utilisateur_id = session.get("utilisateur_id")
    if utilisateur_id is None:
        raise AuthenticationError("Vous devez être connecté pour publier un logement.")

    logement = logement_service.create_published(
        get_db(),
        utilisateur_id,
        request.get_json(silent=True),
    )
    return jsonify(logement=logement), 201


@logements_blueprint.get("/<int:logement_id>")
def get_logement(logement_id):
    return jsonify(logement_service.get_published(get_db(), logement_id))



@logements_blueprint.get('/equipements')
def equipment():
    return jsonify(equipements=[dict(row) for row in owner_repository.list_equipment(get_db())])
