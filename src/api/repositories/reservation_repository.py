"""Requêtes de réservation. Les transactions sont gérées par le service."""

SELECT_DETAIL = """
    SELECT r.*, l.proprietaire_id, l.titre, l.statut AS logement_statut,
           l.capacite, a.ville,
           voyageur.prenom AS voyageur_prenom, voyageur.nom AS voyageur_nom,
           hote.prenom AS hote_prenom, hote.nom AS hote_nom
    FROM reservation r
    JOIN logement l ON l.id = r.logement_id
    JOIN adresse a ON a.id = l.adresse_id
    JOIN utilisateur voyageur ON voyageur.id = r.demandeur_id
    JOIN utilisateur hote ON hote.id = l.proprietaire_id
"""


def find_by_id(connection, reservation_id):
    return connection.execute(SELECT_DETAIL + ' WHERE r.id = ?', (reservation_id,)).fetchone()


def find_for_user(connection, user_id, received=False):
    field = 'l.proprietaire_id' if received else 'r.demandeur_id'
    return connection.execute(
        SELECT_DETAIL + f' WHERE {field} = ? ORDER BY r.date_creation DESC, r.id DESC',
        (user_id,),
    ).fetchall()


def find_booked_dates(connection, listing_id, today):
    return connection.execute(
        """SELECT date_debut, date_fin FROM reservation
           WHERE logement_id = ? AND statut = 'acceptee' AND date_fin > ?
           ORDER BY date_debut""",
        (listing_id, today),
    ).fetchall()


def required_capacity(connection, listing_id, today):
    return connection.execute(
        """SELECT COALESCE(MAX(nombre_voyageurs), 0) FROM reservation
           WHERE logement_id = ? AND statut = 'acceptee' AND date_fin > ?""",
        (listing_id, today),
    ).fetchone()[0]


def has_overlap(connection, listing_id, start, end):
    # Le départ n'est pas une nuit occupée : deux séjours peuvent se suivre.
    return connection.execute(
        """SELECT 1 FROM reservation WHERE logement_id = ? AND statut = 'acceptee'
           AND date_debut < ? AND date_fin > ? LIMIT 1""",
        (listing_id, end, start),
    ).fetchone() is not None


def has_pending_duplicate(connection, listing_id, user_id, start, end):
    return connection.execute(
        """SELECT 1 FROM reservation WHERE logement_id = ? AND demandeur_id = ?
           AND date_debut = ? AND date_fin = ? AND statut = 'en_attente' LIMIT 1""",
        (listing_id, user_id, start, end),
    ).fetchone() is not None


def create(connection, listing_id, user_id, start, end, guests, price, total):
    return connection.execute(
        """INSERT INTO reservation (logement_id, demandeur_id, date_debut, date_fin,
               nombre_voyageurs, prix_nuit_centimes, montant_total_centimes)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (listing_id, user_id, start, end, guests, price, total),
    ).lastrowid


def set_status(connection, reservation_id, status):
    connection.execute('UPDATE reservation SET statut = ? WHERE id = ?', (status, reservation_id))


def refuse_overlapping_requests(connection, row):
    connection.execute(
        """UPDATE reservation SET statut = 'refusee'
           WHERE logement_id = ? AND statut = 'en_attente' AND id != ?
           AND date_debut < ? AND date_fin > ?""",
        (row['logement_id'], row['id'], row['date_fin'], row['date_debut']),
    )
