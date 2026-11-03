from flask import Blueprint, jsonify, session, url_for

from src.api.errors import AuthenticationError
from src.api.services import auth_service, facture_service
from src.db.flask import get_db


factures_blueprint = Blueprint('factures', __name__, url_prefix='/api/factures')


def current_user_id():
    user_id = session.get('utilisateur_id')
    if user_id is None:
        raise AuthenticationError('Connectez-vous pour consulter vos factures.')
    auth_service.get_current_user(get_db(), user_id)
    return user_id


@factures_blueprint.get('')
def list_factures():
    response = jsonify(factures=facture_service.list_for_user(get_db(), current_user_id()))
    response.headers['Cache-Control'] = 'private, no-store'
    return response


@factures_blueprint.get('/<numero>')
def get_facture(numero):
    response = jsonify(facture_service.get_for_user(get_db(), numero, current_user_id()))
    response.headers['Cache-Control'] = 'private, no-store'
    schema_url = url_for('documents.json_schema', filename='facture.schema.json')
    response.headers['Link'] = f'<{schema_url}>; rel="describedby"; type="application/schema+json"'
    return response
