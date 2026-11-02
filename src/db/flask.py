from flask import current_app, g

from src.db.connection import connect


def get_db():
    if "database" not in g:
        g.database = connect(current_app.config["DATABASE"])
    return g.database


def close_db(_error=None):
    connection = g.pop("database", None)
    if connection is not None:
        connection.close()


def init_app(app):
    app.teardown_appcontext(close_db)
