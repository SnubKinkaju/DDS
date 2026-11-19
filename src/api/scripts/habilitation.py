"""Accorder ou retirer l'accès municipal sur un compte existant."""

import argparse
from contextlib import closing

from src.db.connection import connect


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=('accorder', 'retirer'))
    parser.add_argument('email')
    parser.add_argument('--database')
    args = parser.parse_args()
    with closing(connect(args.database)) as db, db:
        update = db.execute(
            'UPDATE utilisateur SET est_admin=? WHERE email=? COLLATE NOCASE',
            (args.action == 'accorder', args.email.strip()),
        )
        if not update.rowcount:
            parser.exit(1, 'Compte introuvable.\n')
    print("Habilitation mise à jour.")


if __name__ == '__main__':
    main()
