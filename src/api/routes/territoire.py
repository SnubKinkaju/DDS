from flask import Blueprint, jsonify, request

from src.api.errors import ValidationError
from src.api.services import adresses, meteo, territoire
from src.api.validation import validate_json
from src.db.flask import get_db


territoire_blueprint = Blueprint('territoire', __name__, url_prefix='/api')


@territoire_blueprint.get('/territoire/adresses')
def suggestions():
    q = request.args.get('q', '').strip()
    if not 1 <= len(q) <= 160:
        raise ValidationError("Saisissez de 1 à 160 caractères pour chercher une adresse.")
    return jsonify(adresses.rechercher(get_db(), q))


@territoire_blueprint.get('/territoire/carte.geojson')
def carte():
    response = jsonify(territoire.carte(get_db()))
    response.mimetype = 'application/geo+json'
    return response


@territoire_blueprint.get('/logements/<int:listing_id>/environnement')
def environnement(listing_id):
    document = territoire.environnement(get_db(), listing_id)
    validate_json(document, 'environnement.schema.json')
    response = jsonify(document)
    response.headers['Link'] = '</api/formats/json/environnement.schema.json>; rel="describedby"'
    return response


@territoire_blueprint.get('/territoire/meteo')
def prevision():
    return jsonify(meteo.prevision(get_db(), request.args.get('archive') == '1'))
