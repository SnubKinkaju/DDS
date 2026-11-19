import sqlite3
from pathlib import Path

from flask import current_app, g


SCHEMA_PATH = Path(__file__).resolve().parents[1] / "schema" / "database.sql"


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def _tables(db):
    return {
        ligne["name"]
        for ligne in db.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table'"
        )
    }


def _colonnes(db, table):
    return {ligne["name"] for ligne in db.execute(f"PRAGMA table_info({table})")}


def _migrer_structure_legacy(db):
    """Ajoute les colonnes attendues avant la création des index."""
    tables = _tables(db)

    if "emetteur" in tables and "prenom" not in _colonnes(db, "emetteur"):
        db.execute(
            "ALTER TABLE emetteur ADD COLUMN prenom TEXT NOT NULL DEFAULT ''"
        )

    if "logement" in tables:
        colonnes_logement = _colonnes(db, "logement")
        if "id" in colonnes_logement and "id_logement" not in colonnes_logement:
            db.execute("ALTER TABLE logement RENAME COLUMN id TO id_logement")
            colonnes_logement = _colonnes(db, "logement")
        if "id_emetteur" not in colonnes_logement:
            db.execute(
                "ALTER TABLE logement ADD COLUMN id_emetteur INTEGER "
                "REFERENCES emetteur(id)"
            )

    if "facture" in tables and "id_sejour" not in _colonnes(db, "facture"):
        db.execute(
            "ALTER TABLE facture ADD COLUMN id_sejour INTEGER "
            "REFERENCES sejour(id)"
        )

    db.commit()


def _completer_donnees_legacy(db):
    """Rattache les anciennes données aux nouvelles relations."""
    db.execute(
        """
        UPDATE logement
        SET id_emetteur = (
            SELECT facture.id_emetteur
            FROM ligne_facture
            JOIN facture
                ON facture.numero = ligne_facture.numero_facture
            WHERE ligne_facture.id_logement = logement.id_logement
            LIMIT 1
        )
        WHERE id_emetteur IS NULL
        """
    )

    factures_sans_sejour = db.execute(
        """
        SELECT
            facture.numero,
            facture.id_client,
            facture.date_facture,
            MIN(ligne_facture.id_logement) AS id_logement,
            COALESCE(SUM(ligne_facture.montant), 0) AS montant_total
        FROM facture
        JOIN ligne_facture
            ON ligne_facture.numero_facture = facture.numero
        WHERE facture.id_sejour IS NULL
        GROUP BY facture.numero
        """
    ).fetchall()

    for facture in factures_sans_sejour:
        curseur = db.execute(
            """
            INSERT INTO sejour (
                id_client, id_logement, date_debut, date_fin,
                statut, montant_total
            ) VALUES (?, ?, ?, ?, 'termine', ?)
            """,
            (
                facture["id_client"],
                facture["id_logement"],
                facture["date_facture"],
                facture["date_facture"],
                facture["montant_total"],
            ),
        )
        db.execute(
            "UPDATE facture SET id_sejour = ? WHERE numero = ?",
            (curseur.lastrowid, facture["numero"]),
        )

    db.commit()


def init_db():
    db = get_db()
    _migrer_structure_legacy(db)
    db.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    _completer_donnees_legacy(db)


def init_app(app):
    app.teardown_appcontext(close_db)
