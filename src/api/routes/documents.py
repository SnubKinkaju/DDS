from pathlib import Path

from flask import Blueprint, Response, abort, current_app, jsonify, render_template, request, send_from_directory

from src.api.errors import NotFoundError
from src.api.repositories.utilisateur_repository import find_public_profile
from src.api.services.logement_service import get_published
from src.api.services.logement_documents import render_logement, graphe
from src.api.services.territoire import environnement
from src.api.validation import FORMATS_DIR, SCHEMAS_DIR
from src.db.flask import get_db


documents_blueprint = Blueprint('documents', __name__, url_prefix='/api')
DOCUMENTS_DIR = Path(__file__).resolve().parents[1] / 'documents'
PUBLIC_SCHEMAS = {
    'facture.schema.json': FORMATS_DIR,
    'environnement.schema.json': FORMATS_DIR,
    'logement.schema.json': FORMATS_DIR,
    'logement-commun.schema.json': FORMATS_DIR,
    'logement-partiel.schema.json': FORMATS_DIR,
    'create-logement.schema.json': SCHEMAS_DIR,
}


@documents_blueprint.get('/utilisateurs/<int:utilisateur_id>/profil.html')
def utilisateur_html(utilisateur_id):
    utilisateur = find_public_profile(get_db(), utilisateur_id)
    if utilisateur is None:
        raise NotFoundError('Ce profil public est introuvable.')
    return render_template('utilisateur.html', utilisateur=utilisateur)


@documents_blueprint.get('/formats/json/<filename>')
def json_schema(filename):
    folder = PUBLIC_SCHEMAS.get(filename)
    if folder is None:
        abort(404)
    return send_from_directory(folder, filename, mimetype='application/schema+json')


@documents_blueprint.get('/documents/fiche.css')
def document_styles():
    return send_from_directory(DOCUMENTS_DIR, 'fiche.css', mimetype='text/css')


@documents_blueprint.get('/formats/xml/facture.xsd')
def facture_xsd():
    return send_from_directory(FORMATS_DIR.parent / 'xml', 'facture.xsd', mimetype='application/xml')


@documents_blueprint.get('/formats/xml/base_de_donnees.xsd')
def base_de_donnees_xsd():
    return send_from_directory(FORMATS_DIR.parent / 'xml', 'base_de_donnees.xsd', mimetype='application/xml')


@documents_blueprint.get('/formats/xml/factures.xsd')
def factures_xsd():
    return send_from_directory(FORMATS_DIR.parent / 'xml', 'factures.xsd', mimetype='application/xml')


def contexte(logement_id):
    db = get_db()
    db.execute('BEGIN')
    return (get_published(db, logement_id), environnement(db, logement_id),
            (current_app.config.get('PUBLIC_ORIGIN') or request.host_url).rstrip('/'))


@documents_blueprint.get('/logements/<int:logement_id>/lieux.jsonld')
def logement_jsonld(logement_id):
    document, env, origin = contexte(logement_id)
    response = jsonify(graphe(document, env, origin))
    response.mimetype = 'application/ld+json'
    return response


@documents_blueprint.get('/logements/<int:logement_id>/fiche.html')
def logement_html(logement_id):
    document, env, origin = contexte(logement_id)
    return Response(render_logement(document, env, 'html', origin), content_type='text/html; charset=utf-8')


@documents_blueprint.get('/logements/<int:logement_id>/fiche.txt')
def logement_text(logement_id):
    document, env, origin = contexte(logement_id)
    response = Response(render_logement(document, env, 'txt', origin), content_type='text/plain; charset=utf-8')
    if request.args.get('telecharger') == '1':
        response.headers['Content-Disposition'] = f'attachment; filename="logement-{logement_id}.txt"'
    return response
