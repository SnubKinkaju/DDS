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
GET /api/logements/{id}/fiche.html
GET /api/logements/{id}/fiche.txt
GET /api/formats/json/{nom-du-schema}
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
GET /api/reservations
GET /api/reservations/recues
POST /api/reservations
PATCH /api/reservations/{id}
GET /api/logements/{id}/dates-reservees
GET /api/factures
GET /api/factures/{numero}
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

## Documents DDS du logement

Le document JSON public est validé avant sa diffusion par
`src/formats/json/logement.schema.json`. Le schéma de saisie et celui de sortie
réutilisent les définitions de `logement-commun.schema.json`.

La fiche HTML et le texte imprimable utilisent ce même document validé.
Les gabarits sont dans `src/api/documents`, la génération dans
`services/logement_documents.py` et les routes dans `routes/documents.py`.

Voir [les formats et leur vérification](../formats/README.md).

## Réservations V1

Le formulaire envoie `logementId`, `dateDebut`, `dateFin` (YYYY-MM-DD) et
`nombreVoyageurs`. Le JSON Schema contrôle la structure ; le service contrôle
les dates (jour courant en Europe/Paris), la publication, la capacité, les
doublons et l'absence de séjour accepté sur cette période. Le demandeur vient
de la session ; prix et total en centimes sont calculés côté serveur puis figés.

Les listes privées sont limitées aux demandes du voyageur ou aux logements de
l'hôte. Le voyageur peut annuler une demande en attente ou acceptée jusqu'au
jour d'arrivée inclus. Seul l'hôte peut accepter ou refuser une demande en
attente. Une acceptation refuse les demandes en attente qui chevauchent les
mêmes nuits. Une demande refusée ne se rouvre pas automatiquement après annulation.

Les transactions `BEGIN IMMEDIATE` protègent vérification et écriture ensemble,
y compris si deux décisions arrivent simultanément. Deux périodes se chevauchent
si `début_existant < fin_demandée AND fin_existante > début_demandé`.
L'endpoint public des dates ne contient ni noms ni identifiants de réservations.
Une capacité ne peut pas être réduite sous celle requise par les séjours acceptés
en cours ou à venir. Masquer une annonce conserve les réservations acceptées.

La table `reservation` existante est utilisée sans migration. Pour cette V1,
les logements publiés sont disponibles hors séjours acceptés : la gestion de
plages d'ouverture via `disponibilite` reste à faire. Les séjours passés gardent
leur statut et sont signalés comme passés à l'écran. L'acceptation émet une facture,
sans déclencher de paiement.

Vérifications réalisées sur une base temporaire : schémas et dates invalides,
droits et isolation des listes, prix figé, doubles demandes, bornes de séjour,
acceptations concurrentes, refus, annulation et capacité. Parcours React vérifié
avec deux sessions navigateur, sur ordinateur et mobile.

## Facturation à l'acceptation

`facture_service.issue` s'exécute dans la même transaction que l'acceptation :
compteur, facture, lignes, changement de statut et refus des demandes concurrentes
sont validés ensemble, ou entièrement annulés. Une acceptation répétée renvoie la
même facture. L'unicité de `reservation_id` et de `numero` est aussi imposée par SQLite.
Le compteur annuel produit `FAC-AAAA-000001` et ne diminue pas après une annulation.

La migration 004 ajoute un `contexte_json` figé : identités et coordonnées disponibles
de l'émetteur et du client, logement et séjour. On ne relit pas les profils pour
reconstruire une facture déjà émise. Une adresse personnelle non collectée reste
`null` ; on ne la remplace pas par celle du logement.

Les lignes décrivent l'hébergement (`nuits × prix conservé à la demande`). La commission
est incluse dans le total : 5 % par défaut, prélevés sur la part de l'émetteur.
Le taux entier est configurable avec `REFUGE_COMMISSION_POURCENT` (0 à 100), puis figé
avec son montant lors de l'émission. Arrondi au centime le plus proche, 0,5 vers le haut.
`netEmetteurCentimes = totalCentimes - commission.montantCentimes`.
La commission n'est pas ajoutée aux lignes une seconde fois.

`facture.schema.json` décrit le document ; `facture_validation.py` vérifie aussi
les dates, quantités, montants, total et commission avant insertion définitive et
à la relecture. Les routes de consultation sont privées (client ou émetteur de
la facture), sans endpoint de création/modification manuelle. Une annulation
du séjour marque la facture `annulee`, en conservant ses données et son numéro.
Pas de paiement, de remboursement ni d'export XML à ce stade.

Vérifications sur base temporaire : documents et arrondis, identités figées après
modification des profils, taux figé, accès privés, acceptations concurrentes,
répétition d'une acceptation, annulation, rollback en cas d'échec d'émission,
numérotation annuelle et séjour gratuit.
