"""Contrôle des documents produits par le serveur, distinct de la saisie."""
import logging

from src.api.errors import ApiError
from src.api.validation import get_validator


def validate_logement_document(document):
    errors = list(get_validator('logement.schema.json').iter_errors(document))
    if errors:
        # Une sortie invalide est une erreur du serveur, pas une faute de saisie.
        logging.getLogger(__name__).error(
            'Document logement %s invalide : %s',
            document.get('id'),
            '; '.join(f'{list(error.path)}: {error.message}' for error in errors),
        )
        raise ApiError("Le document du logement ne peut pas être généré.")
