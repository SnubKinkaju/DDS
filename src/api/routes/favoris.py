from flask import Blueprint, jsonify, session

from src.api.errors import AuthenticationError, NotFoundError
from src.api.services.logement_service import list_published
from src.db.flask import get_db


favoris_blueprint = Blueprint('favoris', __name__, url_prefix='/api/favoris')


@favoris_blueprint.before_request
def connecter():
    if not session.get('utilisateur_id'):
        raise AuthenticationError("Connectez-vous pour retrouver vos favoris.")


@favoris_blueprint.get('')
def liste():
    return jsonify(list_published(get_db(), favori_de=session['utilisateur_id']))


@favoris_blueprint.put('/<int:logement_id>')
def ajouter(logement_id):
    db = get_db()
    with db:
        db.execute('BEGIN IMMEDIATE')
        if not db.execute('SELECT 1 FROM logement_public WHERE id=?', (logement_id,)).fetchone():
            raise NotFoundError("Annonce indisponible.")
        db.execute(
            'INSERT OR IGNORE INTO favori(utilisateur_id,logement_id) VALUES (?,?)',
            (session['utilisateur_id'], logement_id),
        )
    return '', 204


@favoris_blueprint.delete('/<int:logement_id>')
def retirer(logement_id):
    db = get_db()
    with db:
        db.execute(
            'DELETE FROM favori WHERE utilisateur_id=? AND logement_id=?',
            (session['utilisateur_id'], logement_id),
        )
    return '', 204
