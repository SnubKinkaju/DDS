from src.api.errors import AuthenticationError, ForbiddenError, NotFoundError, ValidationError
from src.api.repositories.utilisateur_repository import find_by_id


def require_admin(connection, user_id):
    user = find_by_id(connection, user_id)
    if user is None:
        raise AuthenticationError("Connectez-vous pour accéder à cet espace.")
    if not user['est_admin']:
        raise ForbiddenError("Cet espace est réservé à la mairie.")


def listings(connection):
    return [
        dict(row)
        for row in connection.execute("""
        SELECT id, titre, statut, motif_suspension AS motif, suspendu_le AS suspenduLe
        FROM logement ORDER BY motif_suspension IS NULL, titre, id
    """)
    ]


def moderate(connection, listing_id, payload):
    if not isinstance(payload, dict) or set(payload) != {'motif'}:
        raise ValidationError("Indiquez le motif de suspension, ou null pour lever la suspension.")
    reason = payload['motif']
    if reason is not None:
        if not isinstance(reason, str) or not 1 <= len(reason.strip()) <= 500:
            raise ValidationError("Le motif doit contenir entre 1 et 500 caractères.")
        reason = reason.strip()
    with connection:
        result = connection.execute(
            """
            UPDATE logement SET motif_suspension = ?,
                suspendu_le = CASE WHEN ? IS NULL THEN NULL ELSE CURRENT_TIMESTAMP END
            WHERE id = ?
        """,
            (reason, reason, listing_id),
        )
        if not result.rowcount:
            raise NotFoundError("Ce logement n'existe pas.")
