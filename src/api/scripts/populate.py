"""Ajoute des utilisateurs et logements fictifs à la base de la V1."""
import argparse
import json
import random
import unicodedata
from contextlib import closing
from pathlib import Path

from werkzeug.security import generate_password_hash

from src.api.repositories import logement_repository, owner_repository, utilisateur_repository
from src.api.services.logement_service import get_published
from src.api.validation import validate_json
from src.db.connection import connect
from src.db.migrate import migrate


DATA_PATH = Path(__file__).resolve().parents[2] / 'db/seeds/population.json'
DEMO_PASSWORD = 'RefugeDemo2026!'


def positive_integer(value):
    number = int(value)
    if number < 1:
        raise argparse.ArgumentTypeError('le nombre doit être supérieur à zéro')
    return number


def email_name(value):
    return ''.join(char for char in unicodedata.normalize('NFKD', value)
                   if char.isascii() and char.isalnum()).lower()


def generate_user(data, rng, used_emails):
    prenom, nom = rng.choice(data['prenoms']), rng.choice(data['noms'])
    base = email_name(prenom + nom)
    email, suffix = f'{base}@gmail.com', 2
    while email in used_emails:
        email = f'{base}{suffix}@gmail.com'
        suffix += 1
    used_emails.add(email)
    payload = {
        'prenom': prenom, 'nom': nom, 'email': email,
        'telephone': f'06{rng.randint(0, 99_999_999):08d}',
        'motDePasse': DEMO_PASSWORD,
    }
    validate_json(payload, 'register.schema.json')
    return payload


def generate_logement(data, rng, equipment_ids):
    kind = rng.choice(data['types'])
    payload = {
        'titre': rng.choice(kind['titres']),
        'description': rng.choice(kind['descriptions']),
        'typeLogement': kind['type'],
        'capacite': rng.randint(*kind['capacite']),
        'prixNuitCentimes': rng.randint(*kind['prixNuitCentimes']),
        'adresse': {
            'rue': f"{rng.randint(1, 180)} {rng.choice(data['voies'])}",
            'codePostal': data['ville']['codePostal'],
            'ville': data['ville']['nom'],
        },
        'equipements': rng.sample(equipment_ids, rng.randint(0, min(5, len(equipment_ids)))),
    }
    validate_json(payload, 'create-logement.schema.json')
    return payload


def populate(count=100, users=20, seed=1, database=None):
    if count < 1 or users < 1:
        raise ValueError('Les nombres de logements et utilisateurs doivent être positifs.')
    data = json.loads(DATA_PATH.read_text(encoding='utf-8'))
    rng = random.Random(seed)
    database = migrate(database)
    owner_count = min(count, max(1, (users + 2) // 3))

    with closing(connect(database)) as connection:
        used_emails = {row['email'].lower() for row in connection.execute('SELECT email FROM utilisateur')}
        people = [generate_user(data, rng, used_emails) for _ in range(users)]
        hashes = [generate_password_hash(DEMO_PASSWORD) for _ in people]
        equipment_ids = [row['id'] for row in owner_repository.list_equipment(connection)]

        # Les repositories utilisés ici ne valident pas la transaction eux-mêmes.
        # Tout le lot est validé ensemble, ou annulé si une insertion échoue.
        with connection:
            user_ids = []
            for person, password_hash in zip(people, hashes):
                cursor = connection.execute(
                    '''INSERT INTO utilisateur (prenom, nom, email, telephone, mot_de_passe_hash)
                       VALUES (?, ?, ?, ?, ?)''',
                    (person['prenom'], person['nom'], person['email'], person['telephone'], password_hash),
                )
                user_ids.append(cursor.lastrowid)

            owners = user_ids[:owner_count]
            for owner_id in owners:
                utilisateur_repository.promote_to_owner(connection, owner_id)

            for index in range(count):
                owner_id = owners[index] if index < owner_count else rng.choice(owners)
                payload = generate_logement(data, rng, equipment_ids)
                address = payload['adresse']
                address_id = logement_repository.create_address(
                    connection, address['rue'], address['codePostal'], address['ville'],
                )
                listing_id = logement_repository.create_logement(
                    connection, owner_id, address_id, payload['titre'], payload['description'],
                    payload['typeLogement'], payload['capacite'], payload['prixNuitCentimes'],
                )
                owner_repository.replace_equipment(connection, listing_id, payload['equipements'])
                get_published(connection, listing_id)  # Vérifie aussi le document JSON de sortie.

    print(f'Ajout terminé : {users} utilisateurs ({owner_count} propriétaires), {count} logements.')
    print(f'Base : {database}')
    print(f"Compte propriétaire de démonstration : {people[0]['email']}")
    if users > owner_count:
        print(f"Compte client de démonstration : {people[owner_count]['email']}")
    print(f'Mot de passe des comptes générés : {DEMO_PASSWORD}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--count', type=positive_integer, default=100, help='logements à ajouter')
    parser.add_argument('--users', type=positive_integer, default=20, help='utilisateurs à ajouter')
    parser.add_argument('--seed', type=int, default=1, help='graine du tirage aléatoire')
    parser.add_argument('--database', type=Path, help='chemin de la base SQLite')
    args = parser.parse_args()
    populate(args.count, args.users, args.seed, args.database)


if __name__ == '__main__':
    main()
