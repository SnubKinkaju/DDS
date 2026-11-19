from flask import Blueprint, Response, session, url_for

from src.api.services.administration import require_admin
from src.api.services import export_service, facture_documents
from src.db.flask import get_db


export_blueprint = Blueprint('export', __name__, url_prefix='/api/export')


@export_blueprint.before_request
def autoriser():
    db = get_db()
    db.execute('BEGIN')
    require_admin(db, session.get('utilisateur_id'))


def telechargement(xml, nom, schema):
    response = Response(xml, content_type='application/xml; charset=utf-8')
    response.headers['Content-Disposition'] = f'attachment; filename="{nom}.xml"'
    response.headers['Cache-Control'] = 'private, no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Link'] = f'<{url_for(schema)}>; rel="describedby"; type="application/xml"'
    return response


@export_blueprint.get('/base-de-donnees.xml')
def export_base_de_donnees():
    return telechargement(export_service.render_xml(get_db()), 'base_de_donnees', 'documents.base_de_donnees_xsd')


@export_blueprint.get('/factures.xml')
def export_factures():
    return telechargement(facture_documents.collection_xml(get_db()), 'factures', 'documents.factures_xsd')
