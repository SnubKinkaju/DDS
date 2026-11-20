"""Référentiel local des adresses de La Clusaz (Base Adresse Nationale).

Les 2 544 adresses de la commune sont chargées par la migration
007_adresses_reference.sql. La recherche se fait donc sans appel réseau, dès le
premier caractère, et seule une adresse de ce référentiel peut être enregistrée
pour un logement.
"""

import re
import unicodedata


CODE_INSEE = '74080'
LIMITE = 8


def normaliser(texte):
    """Minuscules sans accents ni ponctuation : « Chemin de l'Étrivaz » → « chemin de l etrivaz »."""
    sans_accents = unicodedata.normalize('NFD', texte)
    sans_accents = ''.join(c for c in sans_accents if unicodedata.category(c) != 'Mn')
    return ' '.join(re.sub(r"[^0-9a-z]+", ' ', sans_accents.lower()).split())


def _serialiser(row):
    return {
        'id': row['id'],
        'rue': row['libelle'],
        'longitude': row['longitude'],
        'latitude': row['latitude'],
    }


def trouver(db, identifiant):
    if not isinstance(identifiant, str):
        return None
    row = db.execute(
        'SELECT id, libelle, longitude, latitude FROM adresse_reference WHERE id = ?',
        (identifiant,),
    ).fetchone()
    return _serialiser(row) if row else None


def rechercher(db, texte, limite=LIMITE):
    """Suggestions pour une saisie libre.

    Sans numéro, on propose les voies (« route des ar » → « Route des Aravis »).
    Avec un numéro, on propose les adresses dont le numéro commence par ce
    nombre, le numéro exact en premier. Les mots peuvent être dans n'importe
    quel ordre : « aravis 164 » trouve « 164 Route du Col des Aravis ».
    """
    mots = normaliser(texte).split()
    numeros = [mot for mot in mots if mot.isdigit()]
    termes = [mot for mot in mots if not mot.isdigit()]
    filtres = ' AND '.join(['voie_recherche LIKE ?'] * len(termes)) or '1'
    motifs = [f'%{terme}%' for terme in termes]

    if not numeros:
        if not termes:
            return {'voies': [], 'adresses': []}
        # Voie complète (choisie dans la liste) : on propose ses numéros.
        lignes = db.execute(
            """SELECT id, libelle, longitude, latitude FROM adresse_reference
               WHERE voie_recherche = ? ORDER BY numero LIMIT ?""",
            (' '.join(termes), limite),
        ).fetchall()
        if lignes:
            return {'voies': [], 'adresses': [_serialiser(row) for row in lignes]}
        lignes = db.execute(
            f"""SELECT voie, COUNT(*) AS total FROM adresse_reference
                WHERE {filtres}
                GROUP BY voie
                ORDER BY voie_recherche LIKE ? DESC, voie
                LIMIT ?""",
            (*motifs, f'{termes[0]}%', limite),
        ).fetchall()
        return {
            'voies': [{'nom': row['voie'], 'adresses': row['total']} for row in lignes],
            'adresses': [],
        }

    numero = numeros[0]
    lignes = db.execute(
        f"""SELECT id, libelle, longitude, latitude FROM adresse_reference
            WHERE CAST(numero AS TEXT) LIKE ? AND {filtres}
            ORDER BY numero = ? DESC, LENGTH(CAST(numero AS TEXT)), voie, numero
            LIMIT ?""",
        (f'{numero}%', *motifs, int(numero), limite),
    ).fetchall()
    return {'voies': [], 'adresses': [_serialiser(row) for row in lignes]}
