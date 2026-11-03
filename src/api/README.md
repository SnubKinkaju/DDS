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
make backend-dev
```

## Premiers endpoints

```text
GET /api/health
GET /api/logements
POST /api/logements
GET /api/logements/{id}
GET /api/logements/mes-logements
GET /api/logements/equipements
GET /api/logements/{id}/gestion
PUT /api/logements/{id}
PATCH /api/logements/{id}/statut
DELETE /api/logements/{id}
POST /api/logements/{id}/photos
DELETE /api/logements/{id}/photos/{photoId}
POST /api/auth/inscription
POST /api/auth/connexion
POST /api/auth/deconnexion
GET /api/auth/moi
```

La session est conservée dans un cookie HTTP-only signé par Flask. En
production, la variable `REFUGE_SECRET_KEY` devra obligatoirement contenir une
clé secrète propre au déploiement.

## Gestion des logements

Les routes de gestion nécessitent une session et vérifient le propriétaire.
Le formulaire de création et de modification utilise le même JSON Schema.
Le tableau `equipements` contient les identifiants du catalogue commun.

La désactivation (`{"statut": "indisponible"}`) masque l'annonce et ses photos
publiques. La republication utilise `{"statut": "publie"}`. Un logement avec
des réservations ne peut pas être supprimé : il faut le désactiver pour
conserver son historique.

L'ajout d'une photo se fait en `multipart/form-data`, champ `photo`, un fichier
par requête. Maximum : 8 photos par logement, 5 Mo et 20 mégapixels par image.
Pillow vérifie le contenu JPEG/PNG/WebP, retire les métadonnées et enregistre
une version JPEG de 2 000 pixels maximum dans `src/db/data/photos/`.
SQLite conserve uniquement le chemin. Les fichiers sont ignorés par Git et
supprimés avec la photo ou le logement. Sauvegarder le dossier avec la base.
