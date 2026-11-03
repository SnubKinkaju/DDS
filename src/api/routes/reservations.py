from flask import Blueprint, jsonify, request, session

from src.api.errors import AuthenticationError
from src.api.services import auth_service, reservation_service
from src.db.flask import get_db


reservations_blueprint = Blueprint('reservations', __name__, url_prefix='/api')


def current_user_id():
    user_id = session.get('utilisateur_id')
    if user_id is None:
        raise AuthenticationError('Connectez-vous pour gérer vos réservations.')
    auth_service.get_current_user(get_db(), user_id)
    return user_id


@reservations_blueprint.get('/reservations')
def my_reservations():
    return jsonify(reservations=reservation_service.list_for_user(get_db(), current_user_id()))


@reservations_blueprint.get('/reservations/recues')
def received_reservations():
    return jsonify(reservations=reservation_service.list_for_user(get_db(), current_user_id(), received=True))


@reservations_blueprint.post('/reservations')
def create_reservation():
    result = reservation_service.create(get_db(), current_user_id(), request.get_json(silent=True))
    return jsonify(reservation=result), 201


@reservations_blueprint.patch('/reservations/<int:reservation_id>')
def update_reservation(reservation_id):
    result = reservation_service.change_status(
        get_db(), reservation_id, current_user_id(), request.get_json(silent=True),
    )
    return jsonify(reservation=result)


@reservations_blueprint.get('/logements/<int:listing_id>/dates-reservees')
def booked_dates(listing_id):
    return jsonify(periodes=reservation_service.booked_dates(get_db(), listing_id))
