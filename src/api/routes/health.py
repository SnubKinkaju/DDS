from flask import Blueprint, jsonify


health_blueprint = Blueprint("health", __name__)


@health_blueprint.get("/api/health")
def health():
    return jsonify(status="ok")
