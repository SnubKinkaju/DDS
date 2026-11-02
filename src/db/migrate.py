import argparse
import re
import sqlite3
from contextlib import closing
from pathlib import Path

from src.db.connection import connect, get_database_path


MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"
MIGRATION_NAME = re.compile(r"^(\d{3})_[a-z0-9_]+\.sql$")


def list_migrations():
    migrations = []

    for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
        match = MIGRATION_NAME.match(path.name)
        if not match:
            raise ValueError(
                f"Nom de migration invalide : {path.name}. "
                "Format attendu : 001_description.sql"
            )
        migrations.append((match.group(1), path))

    return migrations


def create_migration_table(connection):
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migration (
            version TEXT PRIMARY KEY,
            fichier TEXT NOT NULL,
            appliquee_le TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    connection.commit()


def applied_versions(connection):
    rows = connection.execute(
        "SELECT version FROM schema_migration ORDER BY version"
    ).fetchall()
    return {row["version"] for row in rows}


def apply_migration(connection, version, path):
    sql = path.read_text(encoding="utf-8")
    safe_version = version.replace("'", "''")
    safe_name = path.name.replace("'", "''")

    script = f"""
    BEGIN IMMEDIATE;
    {sql}
    INSERT INTO schema_migration (version, fichier)
    VALUES ('{safe_version}', '{safe_name}');
    COMMIT;
    """

    try:
        connection.executescript(script)
    except sqlite3.Error:
        if connection.in_transaction:
            connection.rollback()
        raise


def migrate(database_path=None):
    path = get_database_path(database_path)

    with closing(connect(path)) as connection:
        create_migration_table(connection)
        already_applied = applied_versions(connection)
        pending = [
            migration
            for migration in list_migrations()
            if migration[0] not in already_applied
        ]

        for version, migration_path in pending:
            apply_migration(connection, version, migration_path)
            print(f"Migration {version} appliquée : {migration_path.name}")

    if not pending:
        print("La base de données est déjà à jour.")

    return path


def main():
    parser = argparse.ArgumentParser(
        description="Applique les migrations SQLite dans l'ordre."
    )
    parser.add_argument(
        "--database",
        help="Chemin de la base SQLite. La configuration par défaut est utilisée sinon.",
    )
    arguments = parser.parse_args()

    database_path = migrate(arguments.database)
    print(f"Base de données : {database_path}")


if __name__ == "__main__":
    main()
