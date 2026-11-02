PYTHON ?= python3
NPM ?= npm
VENV := .venv
VENV_PYTHON := $(VENV)/bin/python
VENV_PIP := $(VENV)/bin/pip
VENV_FLASK := $(VENV)/bin/flask

DB := src/server/instance/refuge_climatique.sqlite
NEW_DB ?= src/db/data/refuge_climatique.sqlite3
DELETE_SQL := src/server/schema/delete.sql
COUNT ?= 100
SEED ?= 1
SQL := src/server/data/peuplement.sql
WEB_DIR := src/web
WEB_NODE_MODULES := $(WEB_DIR)/node_modules/.package-lock.json

.DEFAULT_GOAL := help

.PHONY: help install run dev backend-dev frontend-install frontend-dev db-migrate populate verifier drop clean

help:
	@echo "Commandes disponibles :"
	@echo "  make install  Crée l'environnement Python et installe les dépendances"
	@echo "  make run           Applique les migrations et lance la nouvelle API Flask"
	@echo "  make dev           Lance le backend Flask et le frontend React"
	@echo "  make backend-dev   Lance uniquement le backend Flask en mode debug"
	@echo "  make frontend-dev  Lance uniquement le frontend React avec Vite"
	@echo "  make db-migrate  Applique les migrations de la nouvelle base SQLite"
	@echo "  make populate COUNT=100 SEED=1  Génère les factures et écrit $(SQL)"
	@echo "  make verifier Vérifie les exemples contre les schémas JSON, DTD et XSD"
	@echo "  make drop     Supprime les tables de la base de données"
	@echo "  make clean    Supprime uniquement les caches générés"
	@echo "  export ILAAS_API_KEY=\"clé_api_du_prof\""
	@echo "  puis vérifier avec: echo \"\$$ILAAS_API_KEY\""

$(VENV_PYTHON):
	$(PYTHON) -m venv $(VENV)

install: $(VENV_PYTHON)
	$(VENV_PIP) install -r requirements.txt

run: install
	$(VENV_PYTHON) -m src.db.migrate --database $(NEW_DB)
	REFUGE_DATABASE_PATH=$(NEW_DB) $(VENV_FLASK) --app src.api.app run

backend-dev: install
	$(VENV_PYTHON) -m src.db.migrate --database $(NEW_DB)
	REFUGE_DATABASE_PATH=$(NEW_DB) $(VENV_FLASK) --app src.api.app run --debug

$(WEB_NODE_MODULES): $(WEB_DIR)/package.json $(WEB_DIR)/package-lock.json
	cd $(WEB_DIR) && $(NPM) install

frontend-install: $(WEB_NODE_MODULES)

frontend-dev: frontend-install
	cd $(WEB_DIR) && $(NPM) run dev

dev:
	$(MAKE) --no-print-directory -j2 backend-dev frontend-dev

db-migrate: $(VENV_PYTHON)
	$(VENV_PYTHON) -m src.db.migrate --database $(NEW_DB)

populate: install
	$(VENV_PYTHON) -m src.server.scripts.populate --count $(COUNT) --seed $(SEED) --sql $(SQL)

verifier: install
	$(VENV_PYTHON) -m src.server.scripts.verifier_exemples

drop:
	$(VENV_PYTHON) -c "import sqlite3; sqlite3.connect('$(DB)').executescript(open('$(DELETE_SQL)').read())"

clean:
	find . -type f -name '*.py[co]' -not -path './$(VENV)/*' -delete
	find . -type d -name '__pycache__' -not -path './$(VENV)/*' -empty -delete
	rm -rf .pytest_cache
