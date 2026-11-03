"""Vérifie les exemples JSON de la V1 sans modifier la base de données."""
import json
from pathlib import Path

from src.api.validation import get_validator


EXAMPLES_DIR = Path(__file__).resolve().parents[2] / 'formats' / 'examples'


def main():
    cases = [
        ('creation-logement.json', 'create-logement.schema.json', True),
        ('logement.json', 'logement.schema.json', True),
        ('logement-invalide.json', 'logement.schema.json', False),
    ]
    success = True
    for filename, schema, expected_valid in cases:
        document = json.loads((EXAMPLES_DIR / filename).read_text(encoding='utf-8'))
        errors = list(get_validator(schema).iter_errors(document))
        correct = (not errors) == expected_valid
        success = success and correct
        result = 'accepté' if not errors else 'refusé'
        print(f"[{'OK' if correct else 'ERREUR'}] {filename} : {result}")
        for error in errors:
            print(f"  {'.'.join(map(str, error.path)) or '$'} : {error.message}")
    raise SystemExit(0 if success else 1)


if __name__ == '__main__':
    main()
