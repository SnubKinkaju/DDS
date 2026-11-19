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
USERS ?= 20
SEED ?= 1
DEMO_DIR ?= instance/demo
SQL := src/server/data/peuplement.sql
WEB_DIR := src/web
WEB_NODE_MODULES := $(WEB_DIR)/node_modules/.package-lock.json

.DEFAULT_GOAL := help

.PHONY: help install run dev backend-dev frontend-install frontend-dev db-migrate populate populate-legacy verifier verifier-documents drop clean

help:
	@echo "Commandes disponibles :"
	@echo "  make install  Crée l'environnement Python et installe les dépendances"
	@echo "  make dev-demo      Prépare puis lance la démonstration complète"
	@echo "  make import-poi    Actualise les services OSM (EXTRAIT=fichier pour un import local)"
	@echo "  make run           Applique les migrations et lance la nouvelle API Flask"
	@echo "  make dev           Lance le backend Flask et le frontend React"
	@echo "  make backend-dev   Lance uniquement le backend Flask en mode debug"
	@echo "  make frontend-dev  Lance uniquement le frontend React avec Vite"
	@echo "  make db-migrate  Applique les migrations de la nouvelle base SQLite"
	@echo "  make populate COUNT=100 USERS=20 SEED=1  Ajoute des logements et utilisateurs dans la V1"
	@echo "  make populate-legacy COUNT=100  Remplace les factures de l'ancien prototype"
	@echo "  make verifier Vérifie les exemples contre les schémas JSON, DTD et XSD"
	@echo "  make verifier-documents  Vérifie JSON, DTD, XSD, XSLT, XPath et les données liées"
	@echo "  make drop     Supprime les tables de la base de données"
	@echo "  make clean    Supprime uniquement les caches générés"
	@echo "  export ILAAS_API_KEY=\"clé_api_du_prof\""

$(VENV_PYTHON):
	$(PYTHON) -m venv $(VENV)

install: $(VENV_PYTHON)
	$(VENV_PIP) install -r requirements.txt

run: territoire-local
	REFUGE_DATABASE_PATH="$(NEW_DB)" $(VENV_FLASK) --app src.api.app run

backend-dev: territoire-local
	REFUGE_DATABASE_PATH="$(NEW_DB)" $(VENV_FLASK) --app src.api.app run --debug

$(WEB_NODE_MODULES): $(WEB_DIR)/package.json $(WEB_DIR)/package-lock.json
	cd $(WEB_DIR) && $(NPM) install

frontend-install: $(WEB_NODE_MODULES)

frontend-dev: frontend-install
	cd $(WEB_DIR) && $(NPM) run dev

dev:
	$(MAKE) --no-print-directory -j2 backend-dev frontend-dev

db-migrate: $(VENV_PYTHON)
	$(VENV_PYTHON) -m src.db.migrate --database "$(NEW_DB)"

populate: install
	$(VENV_PYTHON) -m src.api.scripts.populate --count $(COUNT) --users $(USERS) --seed $(SEED) --database "$(NEW_DB)"

populate-legacy: install
	$(VENV_PYTHON) -m src.server.scripts.populate --count $(COUNT) --seed $(SEED) --sql $(SQL)

verifier: install
	$(VENV_PYTHON) -m src.server.scripts.verifier_exemples

verifier-documents: demo
	$(VENV_PYTHON) -m src.api.scripts.verifier_documents --database "$(DEMO_DIR)/refuge.sqlite3"

drop:
	$(VENV_PYTHON) -c "import sqlite3; sqlite3.connect('$(DB)').executescript(open('$(DELETE_SQL)').read())"

clean:
	find . -type f -name '*.py[co]' -not -path './$(VENV)/*' -delete
	find . -type d -name '__pycache__' -not -path './$(VENV)/*' -empty -delete
	rm -rf .pytest_cache

.PHONY: demo dev-demo import-poi

demo: install
	$(VENV_PYTHON) -m src.api.scripts.demo --dossier "$(DEMO_DIR)"

dev-demo: demo
	REFUGE_UPLOAD_FOLDER="$(abspath $(DEMO_DIR))/photos" $(MAKE) dev NEW_DB="$(abspath $(DEMO_DIR))/refuge.sqlite3"

import-poi: install db-migrate
	$(VENV_PYTHON) -m src.api.scripts.import_poi --database "$(NEW_DB)" $(if $(EXTRAIT),--extrait "$(EXTRAIT)")

.PHONY: territoire-local
territoire-local: install db-migrate
	$(VENV_PYTHON) -m src.api.scripts.import_poi --database "$(NEW_DB)" --si-absent --extrait src/db/seeds/territoire/lieux-osm.json
