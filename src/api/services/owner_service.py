from src.api.errors import ConflictError, ForbiddenError, NotFoundError, ValidationError
from src.api.repositories import logement_repository, owner_repository
from src.api.services.logement_service import _required_text, serialize_detail
from src.api.validation import validate_json


def require_owner(connection, listing_id, owner_id):
    row = logement_repository.find_by_id(connection, listing_id)
    if row is None:
        raise NotFoundError("Ce logement n'existe pas.")
    if row['proprietaire_id'] != owner_id:
        raise ForbiddenError("Vous ne pouvez gérer que vos propres logements.")
    return row


def get_owned(connection, listing_id, owner_id):
    return serialize_detail(connection, require_owner(connection, listing_id, owner_id))


def list_owned(connection, owner_id):
    return [get_owned(connection, row['id'], owner_id)
            for row in owner_repository.find_owned(connection, owner_id)]


def validate_equipment(connection, equipment_ids):
    available = {row['id'] for row in owner_repository.list_equipment(connection)}
    if any(item not in available for item in equipment_ids):
        raise ValidationError("Un équipement sélectionné n'existe pas.")


def update(connection, listing_id, owner_id, payload):
    row = require_owner(connection, listing_id, owner_id)
    validate_json(payload, 'create-logement.schema.json')
    validate_equipment(connection, payload.get('equipements', []))
    payload['titre'] = _required_text(payload['titre'], 'titre', 3)
    payload['description'] = _required_text(payload['description'], 'description', 10)
    payload['adresse']['rue'] = _required_text(payload['adresse']['rue'], 'adresse.rue', 3)
    with connection:
        owner_repository.update(connection, row, payload)
        owner_repository.replace_equipment(connection, listing_id, payload.get('equipements', []))
    return get_owned(connection, listing_id, owner_id)


def change_status(connection, listing_id, owner_id, payload):
    require_owner(connection, listing_id, owner_id)
    if (not isinstance(payload, dict) or set(payload) != {'statut'}
            or payload['statut'] not in ('publie', 'indisponible')):
        raise ValidationError("Choisissez le statut publié ou indisponible.")
    with connection:
        owner_repository.set_status(connection, listing_id, payload['statut'])
    return get_owned(connection, listing_id, owner_id)


def delete(connection, listing_id, owner_id):
    row = require_owner(connection, listing_id, owner_id)
    photos = logement_repository.find_photos(connection, listing_id)
    with connection:
        if owner_repository.has_reservations(connection, listing_id):
            raise ConflictError("Ce logement a des réservations. Désactivez-le pour conserver son historique.")
        owner_repository.delete(connection, row)
    return photos
