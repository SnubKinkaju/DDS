"""Lectures complètes pour l'export XML : une requête par table, sans mot de passe."""


def find_equipements(connection):
    return connection.execute('SELECT id, nom FROM equipement ORDER BY id').fetchall()


def find_utilisateurs(connection):
    return connection.execute(
        """SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.role, u.date_creation,
                  a.rue, a.code_postal, a.ville
           FROM utilisateur u LEFT JOIN adresse a ON a.id = u.adresse_id
           ORDER BY u.id"""
    ).fetchall()


def find_logements(connection):
    return connection.execute(
        """SELECT l.id, l.proprietaire_id, l.titre, l.description, l.type_logement,
                  l.capacite, l.prix_nuit_centimes, l.statut, l.date_creation,
                  a.rue, a.code_postal, a.ville
           FROM logement l JOIN adresse a ON a.id = l.adresse_id
           ORDER BY l.id"""
    ).fetchall()


def find_photos(connection):
    return connection.execute(
        'SELECT logement_id, url, position FROM photo_logement ORDER BY logement_id, position'
    ).fetchall()


def find_logement_equipements(connection):
    return connection.execute(
        'SELECT logement_id, equipement_id FROM logement_equipement ORDER BY logement_id, equipement_id'
    ).fetchall()


def find_disponibilites(connection):
    return connection.execute('SELECT * FROM disponibilite ORDER BY id').fetchall()


def find_favoris(connection):
    return connection.execute(
        'SELECT * FROM favori ORDER BY utilisateur_id, logement_id'
    ).fetchall()


def find_reservations(connection):
    return connection.execute('SELECT * FROM reservation ORDER BY id').fetchall()


def find_factures(connection):
    return connection.execute('SELECT * FROM facture ORDER BY id').fetchall()


def find_lignes(connection):
    return connection.execute('SELECT * FROM ligne_facture ORDER BY facture_id, id').fetchall()
