import json

from flask import Blueprint, Response, abort, jsonify, request, session, url_for

from src.api.errors import AuthenticationError
from src.api.services import auth_service, facture_service
from src.api.services.facture_documents import render_document
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


@factures_blueprint.get('/<numero>/document.<format_name>')
def facture_document(numero, format_name):
    content_types = {'json': 'application/json', 'xml': 'application/xml',
                     'html': 'text/html', 'txt': 'text/plain'}
    if format_name not in content_types:
        abort(404)
    document = facture_service.get_for_user(get_db(), numero, current_user_id())
    content = (json.dumps(document, ensure_ascii=False, indent=2) + '\n'
               if format_name == 'json' else render_document(document, format_name))
    response = Response(content, content_type=f'{content_types[format_name]}; charset=utf-8')
    response.headers['Cache-Control'] = 'private, no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'self'"
    if request.args.get('telecharger') == '1':
        response.headers['Content-Disposition'] = f'attachment; filename="{document["numero"]}.{format_name}"'
    if format_name == 'xml':
        schema_url = url_for('documents.facture_xsd')
        response.headers['Link'] = f'<{schema_url}>; rel="describedby"; type="application/xml"'
    return response
