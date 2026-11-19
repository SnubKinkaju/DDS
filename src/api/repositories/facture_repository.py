"""Persistance des factures ; aucun commit, la réservation porte la transaction."""
import json


def next_number(connection, year):
    connection.execute(
        """INSERT INTO compteur_facture (annee, dernier_numero) VALUES (?, 1)
           ON CONFLICT(annee) DO UPDATE SET dernier_numero = dernier_numero + 1""",
        (year,),
    )
    sequence = connection.execute(
        'SELECT dernier_numero FROM compteur_facture WHERE annee = ?', (year,),
    ).fetchone()[0]
    return f'FAC-{year}-{sequence:06d}'


def find_by_number(connection, number):
    return connection.execute('SELECT * FROM facture WHERE numero = ?', (number,)).fetchone()


def find_for_reservation(connection, reservation_id):
    return connection.execute('SELECT * FROM facture WHERE reservation_id = ?', (reservation_id,)).fetchone()


def find_for_user(connection, user_id):
    return connection.execute(
        """SELECT * FROM facture
           WHERE json_extract(contexte_json, '$.emetteur.id') = ?
              OR json_extract(contexte_json, '$.client.id') = ?
           ORDER BY id DESC""",
        (user_id, user_id),
    ).fetchall()


def find_lines(connection, invoice_id):
    return connection.execute(
        'SELECT * FROM ligne_facture WHERE facture_id = ? ORDER BY id', (invoice_id,),
    ).fetchall()


def find_person(connection, user_id):
    return connection.execute(
        """SELECT u.id, u.prenom, u.nom, u.email, u.telephone,
                  a.rue, a.code_postal, a.ville
           FROM utilisateur u LEFT JOIN adresse a ON a.id = u.adresse_id
           WHERE u.id = ?""", (user_id,),
    ).fetchone()


def create(connection, reservation_id, number, issued_on, context, total, rate, commission, lines):
    invoice_id = connection.execute(
        """INSERT INTO facture (reservation_id, numero, date_emission, total_centimes,
               contexte_json, taux_commission, commission_centimes)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (reservation_id, number, issued_on, total, json.dumps(context, ensure_ascii=False), rate, commission),
    ).lastrowid
    connection.executemany(
        """INSERT INTO ligne_facture (facture_id, libelle, quantite,
               prix_unitaire_centimes, montant_centimes) VALUES (?, ?, ?, ?, ?)""",
        [(invoice_id, line['libelle'], line['quantite'], line['prixUnitaireCentimes'], line['montantCentimes'])
         for line in lines],
    )
    return find_for_reservation(connection, reservation_id)


def cancel(connection, reservation_id):
    connection.execute(
        "UPDATE facture SET statut = 'annulee' WHERE reservation_id = ? AND statut = 'emise'",
        (reservation_id,),
    )
