from flask import Blueprint, jsonify, request, session

from src.api.services import administration, lieux_municipaux
from src.db.flask import get_db


admin_blueprint = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_blueprint.before_request
def authorize():
    administration.require_admin(get_db(), session.get('utilisateur_id'))


@admin_blueprint.after_request
def private(response):
    response.headers['Cache-Control'] = 'private, no-store'
    return response


@admin_blueprint.get('/logements')
def listings():
    return jsonify(logements=administration.listings(get_db()))


@admin_blueprint.put('/logements/<int:listing_id>/suspension')
def moderate(listing_id):
    administration.moderate(get_db(), listing_id, request.get_json(silent=True))
    return '', 204


@admin_blueprint.get('/territoire')
def bilan():
    return jsonify(lieux_municipaux.bilan(get_db()))


@admin_blueprint.post('/lieux')
def creer_lieu():
    identifiant = lieux_municipaux.enregistrer(
        get_db(), session['utilisateur_id'], request.get_json(silent=True)
    )
    return jsonify(id=identifiant), 201


@admin_blueprint.put('/lieux/<int:identifiant>')
def modifier_lieu(identifiant):
    lieux_municipaux.enregistrer(
        get_db(), session['utilisateur_id'], request.get_json(silent=True), identifiant
    )
    return '', 204


@admin_blueprint.delete('/lieux/<int:identifiant>')
def retirer_lieu(identifiant):
    lieux_municipaux.retirer(get_db(), identifiant, session['utilisateur_id'])
    return '', 204
