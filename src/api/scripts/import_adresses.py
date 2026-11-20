"""Génère la migration du référentiel d'adresses de La Clusaz depuis la BAN.

Source : Base Adresse Nationale, fichier départemental
https://adresse.data.gouv.fr/data/ban/adresses/latest/csv/adresses-74.csv.gz
(Licence Ouverte 2.0). Seules les adresses dont le code Insee est 74080 sont
conservées.

Usage :
    python -m src.api.scripts.import_adresses adresses-74.csv.gz \
        --sortie src/db/migrations/007_adresses_reference.sql

Une migration appliquée ne se modifie pas : pour actualiser le référentiel,
générer une nouvelle migration qui vide puis recharge la table.
"""

import argparse
import csv
import gzip
from datetime import date
from pathlib import Path

from src.api.services.adresses import CODE_INSEE, normaliser


EN_TETE = """-- Référentiel des adresses de La Clusaz (code Insee {code}).
-- Source : Base Adresse Nationale, adresses-74.csv.gz du {jour}, Licence Ouverte 2.0.
-- Fichier généré par src/api/scripts/import_adresses.py : ne pas modifier à la main.

CREATE TABLE adresse_reference (
    id TEXT PRIMARY KEY,
    numero INTEGER NOT NULL CHECK (numero >= 0),
    suffixe TEXT,
    voie TEXT NOT NULL,
    libelle TEXT NOT NULL,
    voie_recherche TEXT NOT NULL,
    longitude REAL NOT NULL CHECK (longitude BETWEEN 6.34 AND 6.60),
    latitude REAL NOT NULL CHECK (latitude BETWEEN 45.81 AND 45.99)
);

CREATE INDEX idx_adresse_reference_voie ON adresse_reference(voie_recherche, numero);
"""


def sql(valeur):
    if valeur is None:
        return 'NULL'
    if isinstance(valeur, (int, float)):
        return repr(valeur)
    return "'" + valeur.replace("'", "''") + "'"


def lire(chemin):
    ouvrir = gzip.open if str(chemin).endswith('.gz') else open
    with ouvrir(chemin, 'rt', encoding='utf-8', newline='') as fichier:
        for ligne in csv.DictReader(fichier, delimiter=';'):
            if ligne['code_insee'] != CODE_INSEE:
                continue
            numero = int(ligne['numero'])
            suffixe = ligne['rep'] or None
            voie = ligne['nom_voie'].strip()
            libelle = f"{numero}{' ' + suffixe if suffixe else ''} {voie}"
            yield (
                ligne['id'], numero, suffixe, voie, libelle, normaliser(voie),
                round(float(ligne['lon']), 6), round(float(ligne['lat']), 6),
            )


def generer(source, sortie, jour):
    adresses = sorted(lire(source), key=lambda a: (a[5], a[1], a[0]))
    if not adresses:
        raise SystemExit(f'Aucune adresse {CODE_INSEE} dans {source}.')
    blocs = [EN_TETE.format(code=CODE_INSEE, jour=jour)]
    for debut in range(0, len(adresses), 500):
        valeurs = ',\n'.join(
            '(' + ', '.join(map(sql, adresse)) + ')'
            for adresse in adresses[debut:debut + 500]
        )
        blocs.append(f'INSERT INTO adresse_reference VALUES\n{valeurs};\n')
    Path(sortie).write_text('\n'.join(blocs), encoding='utf-8')
    print(f'{len(adresses)} adresses écrites dans {sortie}.')


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('source', help='Fichier BAN départemental (.csv ou .csv.gz)')
    parser.add_argument('--sortie', default='src/db/migrations/007_adresses_reference.sql')
    parser.add_argument('--date', default=date.today().isoformat(), help='Date du fichier BAN')
    arguments = parser.parse_args()
    generer(arguments.source, arguments.sortie, arguments.date)


if __name__ == '__main__':
    main()
