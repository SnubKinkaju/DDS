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
│   └── 004_facturation.sql
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
