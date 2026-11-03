"""Facture du séjour : identité figée, lignes, commission incluse et total."""
import json
from datetime import date

from src.api.errors import ApiError, NotFoundError
from src.api.repositories import facture_repository as repository, logement_repository
from src.api.services.facture_validation import commission_amount, validate_document


def _address(row):
    if row['rue'] is None:
        return None
    return {'rue': row['rue'], 'codePostal': row['code_postal'], 'ville': row['ville']}


def _person(connection, user_id):
    row = repository.find_person(connection, user_id)
    return {**{key: row[key] for key in ('id', 'prenom', 'nom', 'email', 'telephone')},
            'adresse': _address(row)}


def serialize(connection, row):
    document = {
        'numero': row['numero'], 'dateEmission': row['date_emission'],
        'statut': row['statut'], 'devise': row['devise'],
        **json.loads(row['contexte_json']),
        'lignes': [{'libelle': line['libelle'], 'quantite': line['quantite'],
                    'prixUnitaireCentimes': line['prix_unitaire_centimes'],
                    'montantCentimes': line['montant_centimes']}
                   for line in repository.find_lines(connection, row['id'])],
        'commission': {'tauxPourcent': row['taux_commission'],
                       'montantCentimes': row['commission_centimes'],
                       'incluseDansTotal': True, 'aLaChargeDe': 'emetteur'},
        'totalCentimes': row['total_centimes'],
        'netEmetteurCentimes': row['total_centimes'] - row['commission_centimes'],
    }
    validate_document(document)
    return document


def issue(connection, reservation, issued_on, rate):
    """Appelé dans la transaction d'acceptation ; une facture au plus par séjour."""
    existing = repository.find_for_reservation(connection, reservation['id'])
    if existing is not None:
        return serialize(connection, existing)
    if not connection.in_transaction:
        raise RuntimeError("L'émission doit appartenir à la transaction de réservation.")
    if isinstance(rate, bool) or not isinstance(rate, int) or not 0 <= rate <= 100:
        raise ApiError('Le taux de commission configuré doit être un entier entre 0 et 100.')
    if reservation['statut'] != 'acceptee':
        raise ApiError('Seul un séjour accepté peut être facturé.')
    listing = logement_repository.find_by_id(connection, reservation['logement_id'])
    nights = (date.fromisoformat(reservation['date_fin']) - date.fromisoformat(reservation['date_debut'])).days
    total = reservation['montant_total_centimes']
    context = {
        'emetteur': _person(connection, reservation['proprietaire_id']),
        'client': _person(connection, reservation['demandeur_id']),
        'logement': {'id': listing['id'], 'titre': listing['titre'],
                     'typeLogement': listing['type_logement'], 'adresse': _address(listing)},
        'sejour': {'reservationId': reservation['id'], 'dateDebut': reservation['date_debut'],
                   'dateFin': reservation['date_fin'], 'nombreNuits': nights,
                   'nombreVoyageurs': reservation['nombre_voyageurs'],
                   'prixNuitCentimes': reservation['prix_nuit_centimes']},
    }
    lines = [{'libelle': f'Hébergement — {nights} nuit(s)', 'quantite': nights,
              'prixUnitaireCentimes': reservation['prix_nuit_centimes'], 'montantCentimes': total}]
    number = repository.next_number(connection, issued_on.year)
    row = repository.create(connection, reservation['id'], number, issued_on.isoformat(),
                            context, total, rate, commission_amount(total, rate), lines)
    return serialize(connection, row)


def get_for_user(connection, number, user_id):
    row = repository.find_by_number(connection, number)
    if row is None:
        raise NotFoundError('Cette facture est introuvable.')
    context = json.loads(row['contexte_json'])
    if user_id not in (context['emetteur']['id'], context['client']['id']):
        raise NotFoundError('Cette facture est introuvable.')
    return serialize(connection, row)


def list_for_user(connection, user_id):
    return [{'numero': row['numero'], 'reservationId': row['reservation_id'],
             'dateEmission': row['date_emission'], 'statut': row['statut'],
             'totalCentimes': row['total_centimes'], 'devise': row['devise'],
             'url': f"/api/factures/{row['numero']}"}
            for row in repository.find_for_user(connection, user_id)]
