def list_equipment(connection):
    return connection.execute("SELECT id, nom FROM equipement ORDER BY nom").fetchall()


def replace_equipment(connection, listing_id, equipment_ids):
    connection.execute("DELETE FROM logement_equipement WHERE logement_id=?", (listing_id,))
    connection.executemany(
        "INSERT INTO logement_equipement (logement_id, equipement_id) VALUES (?, ?)",
        [(listing_id, equipment_id) for equipment_id in equipment_ids],
    )
