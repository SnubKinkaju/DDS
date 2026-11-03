import json
from functools import lru_cache
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

from src.api.errors import ValidationError


SCHEMAS_DIR = Path(__file__).resolve().parent / "schemas"


@lru_cache(maxsize=None)
def _load_schema(schema_name):
    path = SCHEMAS_DIR / schema_name
    return json.loads(path.read_text(encoding="utf-8"))


def _translate_message(error):
    messages = {
        "required": "Un champ obligatoire est manquant.",
        "additionalProperties": "Un champ inattendu a été envoyé.",
        "format": "Le format de cette valeur est invalide.",
        "type": "Le type de cette valeur est invalide.",
        "enum": "Cette valeur ne fait pas partie des choix autorisés.",
        "const": "Cette valeur n'est pas autorisée.",
        "pattern": "Le format de cette valeur est invalide.",
    }

    if error.validator == "minLength":
        return f"Cette valeur doit contenir au moins {error.validator_value} caractères."
    if error.validator == "maxLength":
        return f"Cette valeur doit contenir au maximum {error.validator_value} caractères."
    if error.validator == "minimum":
        return f"Cette valeur doit être supérieure ou égale à {error.validator_value}."
    if error.validator == "maximum":
        return f"Cette valeur doit être inférieure ou égale à {error.validator_value}."

    return messages.get(error.validator, error.message)


def validate_json(payload, schema_name):
    if not isinstance(payload, dict):
        raise ValidationError("Le corps de la requête doit être un objet JSON.")

    validator = Draft202012Validator(
        _load_schema(schema_name),
        format_checker=FormatChecker(),
    )
    errors = sorted(validator.iter_errors(payload), key=lambda error: list(error.path))

    if not errors:
        return

    details = [
        {
            "champ": ".".join(str(part) for part in error.path) or "$",
            "message": _translate_message(error),
        }
        for error in errors
    ]
    raise ValidationError("Les données envoyées sont invalides.", details)
