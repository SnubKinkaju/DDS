import os
import sqlite3
from pathlib import Path


DB_DIR = Path(__file__).resolve().parent
DEFAULT_DATABASE_PATH = DB_DIR / "data" / "refuge_climatique.sqlite3"


def get_database_path(database_path=None):
    configured_path = database_path or os.getenv("REFUGE_DATABASE_PATH")
    return Path(configured_path) if configured_path else DEFAULT_DATABASE_PATH


def connect(database_path=None):
    path = get_database_path(database_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection
