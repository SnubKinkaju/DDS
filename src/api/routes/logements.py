from flask import Blueprint, current_app, jsonify, request, send_from_directory, session

from src.api.errors import AuthenticationError, NotFoundError
from src.api.repositories import owner_repository
from src.api.services import logement_service, owner_service, photo_service
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
    photos = owner_service.delete(get_db(), listing_id, current_user_id())
    photo_service.remove_files(photos, current_app.config['UPLOAD_FOLDER'])
    return '', 204


@logements_blueprint.post('/<int:listing_id>/photos')
def upload_photo(listing_id):
    user_id = current_user_id()
    photo_service.upload(get_db(), listing_id, user_id,
                         request.files.get('photo'), current_app.config['UPLOAD_FOLDER'])
    return jsonify(logement=owner_service.get_owned(get_db(), listing_id, user_id)), 201


@logements_blueprint.delete('/<int:listing_id>/photos/<int:photo_id>')
def delete_photo(listing_id, photo_id):
    user_id = current_user_id()
    photo_service.delete(get_db(), listing_id, photo_id, user_id,
                         current_app.config['UPLOAD_FOLDER'])
    return jsonify(logement=owner_service.get_owned(get_db(), listing_id, user_id))


@logements_blueprint.get('/photos/fichier/<filename>')
def photo_file(filename):
    row = owner_repository.photo_owner(get_db(), photo_service.URL_PREFIX + filename)
    if row is None or (row['statut'] != 'publie'
                       and row['proprietaire_id'] != session.get('utilisateur_id')):
        raise NotFoundError("Cette photo n'est pas disponible.")
    response = send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
    response.headers['Cache-Control'] = 'private, no-cache'
    return response
