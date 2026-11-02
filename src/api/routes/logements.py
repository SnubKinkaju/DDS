from flask import Blueprint, jsonify

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


@logements_blueprint.get("/<int:logement_id>")
def get_logement(logement_id):
    return jsonify(logement_service.get_published(get_db(), logement_id))
