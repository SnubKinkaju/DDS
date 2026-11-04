from flask import Blueprint, Response, session, url_for

from src.api.errors import AuthenticationError
from src.api.services import auth_service, export_service
from src.db.flask import get_db


export_blueprint = Blueprint('export', __name__, url_prefix='/api/export')


@export_blueprint.get('/base-de-donnees.xml')
def export_base_de_donnees():
    """Télécharge toute la base en XML, validé par base_de_donnees.xsd."""
    user_id = session.get('utilisateur_id')
    if user_id is None:
        raise AuthenticationError("Connectez-vous pour exporter la base de données.")
    connection = get_db()
    auth_service.get_current_user(connection, user_id)

    response = Response(export_service.render_xml(connection),
                        content_type='application/xml; charset=utf-8')
    response.headers['Content-Disposition'] = 'attachment; filename="base_de_donnees.xml"'
    response.headers['Cache-Control'] = 'private, no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    schema_url = url_for('documents.base_de_donnees_xsd')
    response.headers['Link'] = f'<{schema_url}>; rel="describedby"; type="application/xml"'
    return response
