# API Flask

La nouvelle API utilise une architecture en couches légère :

```text
Requête HTTP
    ↓
routes/         équivalent des controllers Spring
    ↓
services/       règles métier et construction des réponses
    ↓
repositories/   requêtes SQL uniquement
    ↓
src/db/         connexion SQLite et migrations
```

Les routes ne contiennent ni SQL ni règle métier. Les repositories ne
connaissent pas Flask et peuvent être utilisés indépendamment de HTTP.

## Lancement

```bash
make api-dev
```

## Premiers endpoints

```text
GET /api/health
GET /api/logements
GET /api/logements/{id}
POST /api/auth/inscription
POST /api/auth/connexion
POST /api/auth/deconnexion
GET /api/auth/moi
```

La session est conservée dans un cookie HTTP-only signé par Flask. En
production, la variable `REFUGE_SECRET_KEY` devra obligatoirement contenir une
clé secrète propre au déploiement.
