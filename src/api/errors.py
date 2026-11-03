import sqlite3

from flask import jsonify


class ApiError(Exception):
    status_code = 500
    code = "internal_error"

    def __init__(self, message, details=None):
        super().__init__(message)
        self.message = message
        self.details = details


class ValidationError(ApiError):
    status_code = 400
    code = "validation_error"


class AuthenticationError(ApiError):
    status_code = 401
    code = "authentication_required"


class ConflictError(ApiError):
    status_code = 409
    code = "conflict"


class ForbiddenError(ApiError):
    status_code = 403
    code = "forbidden"


class NotFoundError(ApiError):
    status_code = 404
    code = "not_found"


def register_error_handlers(app):
    @app.errorhandler(413)
    def handle_large_upload(error):
        return jsonify(error={"message": "La photo ne doit pas dépasser 5 Mo."}), 413

    @app.errorhandler(ApiError)
    def handle_api_error(error):
        content = {
            "code": error.code,
            "message": error.message,
        }
        if error.details:
            content["details"] = error.details

        return (
            jsonify(error=content),
            error.status_code,
        )

    @app.errorhandler(sqlite3.Error)
    def handle_database_error(error):
        app.logger.exception("Erreur SQLite", exc_info=error)
        return (
            jsonify(
                error={
                    "code": "database_error",
                    "message": "Une erreur est survenue pendant l'accès aux données.",
                }
            ),
            500,
        )
