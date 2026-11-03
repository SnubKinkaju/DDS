import os
from datetime import timedelta
from pathlib import Path

from flask import Flask

from src.api.errors import register_error_handlers
from src.api.routes.auth import auth_blueprint
from src.api.routes.health import health_blueprint
from src.api.routes.logements import logements_blueprint
from src.db.connection import get_database_path
from src.db.flask import init_app as init_database


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_mapping(
        DATABASE=get_database_path(),
        SECRET_KEY=os.getenv(
            "REFUGE_SECRET_KEY",
            "development-secret-key-change-before-production",
        ),
        PERMANENT_SESSION_LIFETIME=timedelta(days=7),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=False,
        UPLOAD_FOLDER=Path(__file__).resolve().parents[1] / "db/data/photos",
        MAX_CONTENT_LENGTH=6 * 1024 * 1024,
    )
    app.json.sort_keys = False

    if test_config:
        app.config.update(test_config)

    init_database(app)
    register_error_handlers(app)
    app.register_blueprint(auth_blueprint)
    app.register_blueprint(health_blueprint)
    app.register_blueprint(logements_blueprint)
    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
