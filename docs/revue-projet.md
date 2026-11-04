# Revue de projet — Refuge climatique

Support de la revue de projet, à comparer avec l'énoncé
(`docs/Projet M1 Doc Num Refuge climatique.pdf`). Il décrit **la dernière
version de l'application** : React (`src/web`), API Flask (`src/api`),
SQLite (`src/db`) et formats de documents (`src/formats`).

Le projet est en cours : ce document dresse l'état des lieux et la liste de
ce qu'il reste à faire pour la version finale.

## 1. Présentation

Plateforme de mise en relation entre des propriétaires de logements et des
« réfugiés climatiques » cherchant un lieu moins exposé à la chaleur. Elle est
concentrée sur un territoire, **La Clusaz** (environ 1 040 m d'altitude), et
prélève une commission de 5 %, incluse dans le prix.

```text
React (Vite)  ──►  API Flask  ──►  SQLite (migrations numérotées)
                      │
                      ├─ JSON Schema : logements, factures
                      ├─ XML + XSD + XSLT : factures
                      └─ ILaaS (LLM) : préremplissage des annonces
```

Lancement : `make dev`, puis ouvrir <http://localhost:5173>.

## 2. Ce que fait l'application

### Comptes

- Inscription, connexion et déconnexion, avec rôles client et propriétaire.
- Menu de compte, parcours protégés par connexion.

### Annonces

- Accueil avec annonces réelles, recherche par texte, type et capacité,
  catalogue, fiche logement.
- **Publier un logement** : formulaire, choix des équipements, ajout de photos.
- **Mes logements** : modifier, désactiver, republier, supprimer. Une annonce
  désactivée disparaît du catalogue mais reste modifiable.
- **Préremplir avec l'IA** : le propriétaire décrit son logement en texte libre,
  le LLM (ILaaS) propose un JSON partiel, contrôlé par `logement-partiel.schema.json`.
  Le formulaire est prérempli et modifiable ; rien n'est enregistré avant la
  publication, qui applique les contrôles habituels.
- Profil public du propriétaire, ouvert depuis la fiche.

### Réservations

- Demande de séjour (dates, voyageurs), tarif figé à la création.
- **Demandes reçues** : le propriétaire accepte ou refuse.
- **Mes séjours** : le voyageur suit ses demandes et peut annuler jusqu'au jour
  d'arrivée.
- Les dates sont bloquées après acceptation ; les demandes concurrentes sur la
  période sont refusées automatiquement. Le jour de départ reste libre.

### Factures

- Une facture est créée dans la même transaction que l'acceptation
  (numéro `FAC-2026-000001`). Elle conserve l'émetteur, le client, le logement et
  le séjour tels qu'à l'émission.
- Commission de 5 % incluse dans le prix (taux configurable pour les prochaines
  factures), calculs en centimes entiers, annulation sans perte de la facture
  (statut `annulee`).
- Accès réservé à l'hébergeur et au voyageur concernés.
- Fenêtre **Voir la facture** avec trois onglets : **Imprimable**, **JSON**, **Texte**.
  Téléchargement de chaque format, **Exporter XML**, impression (A4) et
  enregistrement PDF par le navigateur.

### Peuplement

`make populate COUNT=100 USERS=20 SEED=1` ajoute des logements et utilisateurs
fictifs (La Clusaz, équipements du catalogue), en une transaction, de façon
reproductible avec la même graine.

## 3. Documents et formats du cours

| Technique | Mise en œuvre dans la dernière version |
|---|---|
| **JSON Schema** | Création de logement, document public du logement, saisie partielle (LLM), facture ; règles communes partagées par `$ref` (`src/formats/json`, `src/api/schemas`) |
| **JSON** | Document public d'un logement servi par l'API avec un en-tête `Link` `describedby` vers son schéma |
| **XML + XSD** | Facture XML validée par `src/formats/xml/facture.xsd` avant chaque rendu |
| **DTD** | `src/formats/xml/facture.dtd` : même structure que le XSD (entités paramètres, attributs énumérés), sans les types ni les motifs que seule une DTD ne sait pas exprimer |
| **XSLT** | Facture XML → HTML imprimable (`facture.xsl`) et → texte (`facture-texte.xsl`), feuille commune `facture-commun.xsl`, exécutées côté serveur avec lxml |
| **RDFa** | Page publique d'un utilisateur : vocabulaire schema.org `Person` |
| **LLM** | ILaaS (`mistral-small-4-119b` par défaut), clé uniquement côté serveur |
| **Base de données** | SQLite, migrations 001 à 004 : adresse, utilisateur, logement, photo, équipement, disponibilité, favori, réservation, facture, ligne de facture, compteur de factures |
| **Liens entre données** | Catalogue → fiche → profil propriétaire → réservations → factures |

Documents produits :

| Objet | Routes |
|---|---|
| Logement | `/api/logements/{id}` (JSON), `/fiche.html` (HTML A4 imprimable), `/fiche.txt` (texte) |
| Facture | `/api/factures/{numero}/document.{json,xml,html,txt}` |
| Schémas | `/api/formats/json/{schema}`, `/api/formats/xml/facture.xsd` |
| Profil | `/api/utilisateurs/{id}/profil.html` (RDFa) |

La présentation HTML et texte du logement est produite par Python et Jinja
(`src/api/documents`) ; celle de la facture par XSLT.

### Vérifications réalisées

- `make verifier-documents` : exemples de logement valides acceptés, exemple
  invalide (prix négatif) refusé.
- Parcours testé sur l'API avec une base temporaire : connexion, réservation,
  acceptation, facture en JSON, XML, HTML et texte.
- Pas encore de tests automatisés ni de test avec une clé ILaaS réelle.

## 4. Correspondance avec l'énoncé

| Rendu | Exigence | État |
|---|---|---|
| 1 | JSON + JSON Schema des logements | ✅ |
| 1 | XML + DTD + XSD de la facture | ✅ XML, XSD et DTD (la DTD valide la forme, le XSD valide aussi les types) |
| 2 | Modèle de base de données | ✅ |
| 2 | Texte libre → JSON → base (LLM) | ✅ implémenté ; ⏳ à tester avec la clé ILaaS |
| 2 | Liaisons entre données pour la navigation | ✅ |
| 2 | Facture XML depuis la base, avec sélection du séjour | ✅ depuis **Mes réservations → Voir la facture** |
| 3 | Compléter le schéma de la base | ⚠️ `favori` et `disponibilite` existent mais ne sont pas exploitées ; pas de données climatiques |
| 3 | Peupler la base | ✅ |
| 3 | Page HTML du propriétaire avec RDFa | ✅ ; test avec l'outil Google à faire |
| 3 | XML de la base + requêtes XPath en ligne | ❌ à réaliser |
| 4 | XSLT : facture en HTML et en format imprimable | ✅ |
| 4 | Présentation d'un logement (JSON) | ⚠️ faite avec Python + Jinja, pas avec XSLT |
| 4 | Revue de projet | ⏳ ce document |

Pour l'énoncé général, la mise en relation, la commission et les rôles
propriétaire/réfugié sont couverts. La partie « informations de localisation
et statut de refuge climatique » (météo, services) reste à faire.

## 5. Ce qu'il reste à faire pour la version finale

### Priorité haute

1. **Export XML global et interface XPath** (rendu 3)
   - Générer un XML de la base (factures, et idéalement logements et utilisateurs)
     avec son schéma.
   - Page d'interrogation en ligne : coller ou charger le XML, écrire une requête
     XPath, voir le résultat. Requêtes de démonstration : par client, période,
     montant ou logement.
   - Réserver cette fonction à un futur **rôle administrateur de la mairie** : les
     factures contiennent des données personnelles, un utilisateur ne doit voir
     que les siennes.
2. **RDFa sur la fiche logement** (type `Accommodation`, adresse, équipements)
   et test des pages avec l'outil Google.
3. **Dimension climatique** (voir `docs/fiche-realisation-dimension-climatique.md`) :
   - adresse géocodée, limitée à La Clusaz ;
   - altitude du terrain, ombrage extérieur renseigné par l'hébergeur ;
   - équipements contre la chaleur mis en valeur ;
   - services proches (pharmacies, points d'eau, transports) avec distances ;
   - météo datée avec cache ;
   - carte des logements (aujourd'hui, la page Carte n'affiche que La Clusaz) ;
   - GeoJSON de la carte.

   C'est ce qui distingue le projet d'une plateforme de location classique.
4. **Tester le préremplissage LLM** avec une clé ILaaS réelle.

### Priorité moyenne

- **XSLT pour la présentation du logement** (rendu 4) : convertir le JSON en XML
  puis appliquer une feuille XSLT, ou justifier le choix Python + Jinja.
- Exploiter les tables `favori` et `disponibilite` : page Favoris et gestion des
  disponibilités (page « Prochainement » aujourd'hui).
- **Messages** entre voyageur et hébergeur (page « Prochainement »).
- Tests automatisés : validation, réservations concurrentes, factures, droits d'accès.

### Pour aller plus loin

- Rôle administrateur de la mairie : modération et vérification des offres.
- Prix solidaires ou offres gratuites pour les personnes vulnérables.
- Alertes de canicule, comparaison avec la température de la ville d'origine.
- Itinéraires et horaires de transport réels.
- Paiement réel (aucun paiement n'est déclenché aujourd'hui).

## 6. Plan de démonstration

1. `make populate` puis `make dev`.
2. Publier un logement avec **Préremplir avec l'IA** (clé ILaaS), ajouter des photos.
3. Réserver avec un compte voyageur ; accepter avec le compte hébergeur.
4. Ouvrir la facture : onglets imprimable, JSON, texte ; exporter le XML.
5. Montrer les schémas JSON Schema, le XSD et les feuilles XSLT ;
   lancer `make verifier-documents`.
6. Ouvrir le profil propriétaire et montrer les annotations RDFa.
7. *(À ajouter une fois réalisé)* Export XML global et requêtes XPath.
