"""Validation du document produit et de la cohérence de ses montants."""
from datetime import date

from src.api.errors import ApiError
from src.api.validation import get_validator


def commission_amount(total, rate):
    # Arrondi au centime le plus proche (0,5 vers le haut), sans flottants.
    return (total * rate + 50) // 100


def validate_document(document):
    if not get_validator('facture.schema.json').is_valid(document):
        raise ApiError('Le document de facture ne respecte pas son schéma.')
    stay, lines, commission = document['sejour'], document['lignes'], document['commission']
    nights = (date.fromisoformat(stay['dateFin']) - date.fromisoformat(stay['dateDebut'])).days
    total = document['totalCentimes']
    valid = (
        nights == stay['nombreNuits'] and nights > 0
        and total == stay['prixNuitCentimes'] * nights
        and total == sum(line['montantCentimes'] for line in lines)
        and all(line['quantite'] * line['prixUnitaireCentimes'] == line['montantCentimes'] for line in lines)
        and commission['montantCentimes'] == commission_amount(total, commission['tauxPourcent'])
        and document['netEmetteurCentimes'] == total - commission['montantCentimes']
    )
    if not valid:
        raise ApiError('Les montants de la facture sont incohérents.')
