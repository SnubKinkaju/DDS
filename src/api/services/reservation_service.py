"""Demandes de séjour et décisions, sans paiement ni facturation à ce stade."""
from datetime import date, datetime
from zoneinfo import ZoneInfo

from src.api.errors import ConflictError, ForbiddenError, NotFoundError, ValidationError
from src.api.repositories import logement_repository, reservation_repository as repository
from src.api.validation import validate_json


def today():
    return datetime.now(ZoneInfo('Europe/Paris')).date()


def serialize(row, user_id):
    start, end = date.fromisoformat(row['date_debut']), date.fromisoformat(row['date_fin'])
    actions = []
    if user_id == row['demandeur_id'] and row['statut'] in ('en_attente', 'acceptee') and start >= today():
        actions.append('annulee')
    if user_id == row['proprietaire_id'] and row['statut'] == 'en_attente':
        actions.append('refusee')
        if (start >= today() and row['logement_statut'] == 'publie'
                and row['nombre_voyageurs'] <= row['capacite']):
            actions.append('acceptee')
    return {
        'id': row['id'], 'statut': row['statut'], 'actions': actions,
        'dateDebut': row['date_debut'], 'dateFin': row['date_fin'],
        'nombreVoyageurs': row['nombre_voyageurs'], 'nombreNuits': (end - start).days,
        'prixNuitCentimes': row['prix_nuit_centimes'],
        'montantTotalCentimes': row['montant_total_centimes'],
        'logement': {'id': row['logement_id'], 'titre': row['titre'],
                     'ville': row['ville'], 'statut': row['logement_statut']},
        'voyageur': {'prenom': row['voyageur_prenom'], 'nom': row['voyageur_nom']},
        'proprietaire': {'prenom': row['hote_prenom'], 'nom': row['hote_nom']},
    }


def list_for_user(connection, user_id, received=False):
    return [serialize(row, user_id) for row in repository.find_for_user(connection, user_id, received)]


def published_listing(connection, listing_id):
    row = logement_repository.find_by_id(connection, listing_id)
    if row is None or row['statut'] != 'publie':
        raise NotFoundError("Ce logement n'est plus disponible à la réservation.")
    return row


def booked_dates(connection, listing_id):
    published_listing(connection, listing_id)
    return [{'dateDebut': row['date_debut'], 'dateFin': row['date_fin']}
            for row in repository.find_booked_dates(connection, listing_id, today().isoformat())]


def create(connection, user_id, payload):
    validate_json(payload, 'create-reservation.schema.json')
    start, end = date.fromisoformat(payload['dateDebut']), date.fromisoformat(payload['dateFin'])
    if start < today() or end <= start:
        raise ValidationError("L'arrivée doit être aujourd'hui ou plus tard, et le départ après l'arrivée.")

    with connection:
        # Verrou avant les lectures : une autre acceptation ne peut pas s'intercaler.
        connection.execute('BEGIN IMMEDIATE')
        listing = published_listing(connection, payload['logementId'])
        if listing['proprietaire_id'] == user_id:
            raise ForbiddenError('Vous ne pouvez pas réserver votre propre logement.')
        if payload['nombreVoyageurs'] > listing['capacite']:
            raise ValidationError('Le nombre de voyageurs dépasse la capacité du logement.')
        if repository.has_overlap(connection, listing['id'], start.isoformat(), end.isoformat()):
            raise ConflictError('Ce logement est déjà réservé sur cette période.')
        if repository.has_pending_duplicate(connection, listing['id'], user_id, start.isoformat(), end.isoformat()):
            raise ConflictError('Vous avez déjà une demande en attente pour ces dates.')
        price = listing['prix_nuit_centimes']
        reservation_id = repository.create(
            connection, listing['id'], user_id, start.isoformat(), end.isoformat(),
            payload['nombreVoyageurs'], price, price * (end - start).days,
        )
        result = serialize(repository.find_by_id(connection, reservation_id), user_id)
    return result


def change_status(connection, reservation_id, user_id, payload):
    validate_json(payload, 'update-reservation.schema.json')
    status = payload['statut']
    with connection:
        connection.execute('BEGIN IMMEDIATE')
        row = repository.find_by_id(connection, reservation_id)
        if row is None:
            raise NotFoundError("Cette réservation n'existe pas.")
        expected_user = row['demandeur_id'] if status == 'annulee' else row['proprietaire_id']
        if user_id != expected_user:
            raise ForbiddenError("Vous n'êtes pas autorisé à effectuer cette action.")
        allowed_states = ('en_attente', 'acceptee') if status == 'annulee' else ('en_attente',)
        if row['statut'] not in allowed_states:
            raise ConflictError('Cette demande a déjà été traitée. Actualisez la liste.')
        if status != 'refusee' and date.fromisoformat(row['date_debut']) < today():
            raise ConflictError("Le séjour a déjà commencé : cette action n'est plus possible.")
        if status == 'acceptee':
            listing = published_listing(connection, row['logement_id'])
            if row['nombre_voyageurs'] > listing['capacite']:
                raise ConflictError('La capacité du logement ne permet plus ce séjour.')
            if repository.has_overlap(connection, row['logement_id'], row['date_debut'], row['date_fin']):
                raise ConflictError('Une autre réservation occupe déjà ces dates.')
            repository.refuse_overlapping_requests(connection, row)
        repository.set_status(connection, reservation_id, status)
        result = serialize(repository.find_by_id(connection, reservation_id), user_id)
    return result
