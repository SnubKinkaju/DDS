def find_published(connection):
    return connection.execute(
        """
        SELECT
            logement.id,
            logement.titre,
            logement.description,
            logement.type_logement,
            logement.capacite,
            logement.prix_nuit_centimes,
            adresse.rue,
            adresse.code_postal,
            adresse.ville,
            (
                SELECT photo_logement.url
                FROM photo_logement
                WHERE photo_logement.logement_id = logement.id
                ORDER BY photo_logement.position, photo_logement.id
                LIMIT 1
            ) AS photo_principale
        FROM logement
        JOIN adresse ON adresse.id = logement.adresse_id
        WHERE logement.statut = 'publie'
        ORDER BY logement.date_creation DESC, logement.id DESC
        """
    ).fetchall()


def find_published_by_id(connection, logement_id):
    return connection.execute(
        """
        SELECT
            logement.id,
            logement.proprietaire_id,
            logement.titre,
            logement.description,
            logement.type_logement,
            logement.capacite,
            logement.prix_nuit_centimes,
            adresse.rue,
            adresse.code_postal,
            adresse.ville,
            utilisateur.prenom AS proprietaire_prenom,
            utilisateur.nom AS proprietaire_nom
        FROM logement
        JOIN adresse ON adresse.id = logement.adresse_id
        JOIN utilisateur ON utilisateur.id = logement.proprietaire_id
        WHERE logement.id = ? AND logement.statut = 'publie'
        """,
        (logement_id,),
    ).fetchone()


def find_photos(connection, logement_id):
    return connection.execute(
        """
        SELECT id, url, position
        FROM photo_logement
        WHERE logement_id = ?
        ORDER BY position, id
        """,
        (logement_id,),
    ).fetchall()


def find_equipements(connection, logement_id):
    return connection.execute(
        """
        SELECT equipement.id, equipement.nom
        FROM equipement
        JOIN logement_equipement
            ON logement_equipement.equipement_id = equipement.id
        WHERE logement_equipement.logement_id = ?
        ORDER BY equipement.nom
        """,
        (logement_id,),
    ).fetchall()
