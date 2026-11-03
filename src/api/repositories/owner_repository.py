def find_owned(connection, owner_id):
    return connection.execute(
        "SELECT id FROM logement WHERE proprietaire_id = ? ORDER BY id DESC",
        (owner_id,),
    ).fetchall()


def list_equipment(connection):
    return connection.execute("SELECT id, nom FROM equipement ORDER BY nom").fetchall()


def update(connection, row, payload):
    connection.execute(
        """UPDATE logement SET titre=?, description=?, type_logement=?,
           capacite=?, prix_nuit_centimes=? WHERE id=?""",
        (payload['titre'], payload['description'], payload['typeLogement'],
         payload['capacite'], payload['prixNuitCentimes'], row['id']),
    )
    address = payload['adresse']
    connection.execute(
        "UPDATE adresse SET rue=?, code_postal=?, ville=? WHERE id=?",
        (address['rue'], address['codePostal'], address['ville'], row['adresse_id']),
    )


def replace_equipment(connection, listing_id, equipment_ids):
    connection.execute("DELETE FROM logement_equipement WHERE logement_id=?", (listing_id,))
    connection.executemany(
        "INSERT INTO logement_equipement (logement_id, equipement_id) VALUES (?, ?)",
        [(listing_id, equipment_id) for equipment_id in equipment_ids],
    )


def set_status(connection, listing_id, status):
    connection.execute("UPDATE logement SET statut=? WHERE id=?", (status, listing_id))


def has_reservations(connection, listing_id):
    return connection.execute(
        "SELECT 1 FROM reservation WHERE logement_id=? LIMIT 1", (listing_id,),
    ).fetchone() is not None


def delete(connection, row):
    connection.execute("DELETE FROM logement WHERE id=?", (row['id'],))
    connection.execute(
        """DELETE FROM adresse WHERE id=?
           AND NOT EXISTS (SELECT 1 FROM logement WHERE adresse_id=?)
           AND NOT EXISTS (SELECT 1 FROM utilisateur WHERE adresse_id=?)""",
        (row['adresse_id'],) * 3,
    )


def add_photo(connection, listing_id, url):
    cursor = connection.execute(
        """INSERT INTO photo_logement (logement_id, url, position)
           SELECT ?, ?, COALESCE(MAX(position), -1) + 1
           FROM photo_logement WHERE logement_id=?""",
        (listing_id, url, listing_id),
    )
    return cursor.lastrowid


def delete_photo(connection, listing_id, photo_id):
    connection.execute(
        "DELETE FROM photo_logement WHERE logement_id=? AND id=?", (listing_id, photo_id),
    )


def photo_owner(connection, url):
    return connection.execute(
        """SELECT logement.proprietaire_id, logement.statut FROM photo_logement
           JOIN logement ON logement.id=photo_logement.logement_id WHERE url=?""",
        (url,),
    ).fetchone()
