from flask import Blueprint, jsonify, request, session

from src.api.errors import AuthenticationError
from src.api.repositories import owner_repository
from src.api.services import logement_service, owner_service
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


def current_user_id():
    user_id = session.get('utilisateur_id')
    if user_id is None:
        raise AuthenticationError("Connectez-vous pour gérer vos logements.")
    return user_id


@logements_blueprint.get('/mes-logements')
def my_listings():
    return jsonify(logements=owner_service.list_owned(get_db(), current_user_id()))


@logements_blueprint.get('/equipements')
def equipment():
    return jsonify(equipements=[dict(row) for row in owner_repository.list_equipment(get_db())])


@logements_blueprint.get('/<int:listing_id>/gestion')
def owned_listing(listing_id):
    return jsonify(owner_service.get_owned(get_db(), listing_id, current_user_id()))


@logements_blueprint.put('/<int:listing_id>')
def update_listing(listing_id):
    return jsonify(logement=owner_service.update(
        get_db(), listing_id, current_user_id(), request.get_json(silent=True),
    ))


@logements_blueprint.patch('/<int:listing_id>/statut')
def change_status(listing_id):
    return jsonify(logement=owner_service.change_status(
        get_db(), listing_id, current_user_id(), request.get_json(silent=True),
    ))


@logements_blueprint.delete('/<int:listing_id>')
def delete_listing(listing_id):
    owner_service.delete(get_db(), listing_id, current_user_id())
    return '', 204
