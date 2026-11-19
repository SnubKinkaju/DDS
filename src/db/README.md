# Base de données

La nouvelle application utilise SQLite et des migrations SQL numérotées.

## Organisation

```text
src/db/
├── connection.py
├── migrate.py
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_email_unique_case_insensitive.sql
│   ├── 003_equipements.sql
│   ├── 004_facturation.sql
│   ├── 005_administration.sql
│   └── 006_territoire.sql
└── data/
    ├── refuge_climatique.sqlite3
    └── photos/                   # images importées, ignorées par Git
```

Chaque modification du schéma doit être ajoutée dans un nouveau fichier :

```text
002_ajout_champ_exemple.sql
003_nouvelle_table.sql
```

Une migration déjà appliquée ne doit pas être modifiée. La table
`schema_migration` conserve la liste des fichiers exécutés.

Pour appliquer les migrations :

```bash
make db-migrate
```

La migration 004 ajoute le contexte figé des factures (JSON), le taux et le montant
de commission, ainsi qu'un compteur annuel. Les montants et les lignes restent
dans les tables `facture` et `ligne_facture`. Elle ne crée aucune facture pour les
réservations existantes : l'émission est déclenchée par l'acceptation dans l'API.


La migration 005 introduit l’habilitation de la mairie et la suspension de diffusion. La vue `logement_public` alimente le catalogue et la carte. La migration 006 conserve les positions vérifiées, le catalogue de lieux, l’état de l’import et le cache météo. Une annonce antérieure conserve son adresse avec une localisation à confirmer.

Les tables et leurs relations figurent dans le [DBML](../../docs/schemas/schema-bdd-v1.dbml). Le rapprochement entre un logement et un lieu se calcule depuis leurs coordonnées. [Données de démonstration et attribution](seeds/territoire/README.md)
