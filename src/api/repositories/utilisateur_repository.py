def find_by_id(connection, utilisateur_id):
    return connection.execute(
        """
        SELECT id, prenom, nom, email, telephone, role, date_creation
        FROM utilisateur
        WHERE id = ?
        """,
        (utilisateur_id,),
    ).fetchone()


def find_public_profile(connection, utilisateur_id):
    return connection.execute(
        """
        SELECT utilisateur.id, prenom, nom, email, telephone,
               COUNT(logement.id) AS nombre_logements
        FROM utilisateur
        JOIN logement ON logement.proprietaire_id = utilisateur.id
        WHERE utilisateur.id = ? AND logement.statut = 'publie'
        GROUP BY utilisateur.id
        """,
        (utilisateur_id,),
    ).fetchone()


def find_by_email(connection, email):
    return connection.execute(
        """
        SELECT
            id,
            prenom,
            nom,
            email,
            telephone,
            role,
            date_creation,
            mot_de_passe_hash
        FROM utilisateur
        WHERE LOWER(email) = LOWER(?)
        """,
        (email,),
    ).fetchone()


def create(connection, prenom, nom, email, password_hash, telephone=None):
    cursor = connection.execute(
        """
        INSERT INTO utilisateur (
            prenom,
            nom,
            email,
            mot_de_passe_hash,
            telephone,
            role
        )
        VALUES (?, ?, ?, ?, ?, 'client')
        """,
        (prenom, nom, email, password_hash, telephone),
    )
    connection.commit()
    return find_by_id(connection, cursor.lastrowid)


def promote_to_owner(connection, utilisateur_id):
    connection.execute(
        """
        UPDATE utilisateur
        SET role = 'proprietaire'
        WHERE id = ? AND role = 'client'
        """,
        (utilisateur_id,),
    )
