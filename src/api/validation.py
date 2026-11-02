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
            "message": error.message,
        }
        for error in errors
    ]
    raise ValidationError("Les données envoyées sont invalides.", details)
