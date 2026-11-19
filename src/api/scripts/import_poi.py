import argparse
from contextlib import closing
from src.api.services.import_lieux import importer
from src.db.connection import connect


def main():
    parser = argparse.ArgumentParser(
        description="Actualiser les services de La Clusaz depuis OpenStreetMap."
    )
    parser.add_argument('--database')
    parser.add_argument('--extrait', help='Fichier JSON Overpass à utiliser hors ligne')
    parser.add_argument(
        '--si-absent', action='store_true', help='Initialiser uniquement un catalogue vide'
    )
    args = parser.parse_args()
    with closing(connect(args.database)) as db:
        if (
            args.si_absent
            and db.execute(
                "SELECT 1 FROM import_territoire WHERE source='osm' AND succes_le IS NOT NULL"
            ).fetchone()
        ):
            return
        try:
            print(f"{importer(db, args.extrait)} lieux actifs après import.")
        except ValueError as error:
            parser.exit(1, f"{error}\n")


if __name__ == '__main__':
    main()
