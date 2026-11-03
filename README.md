# Refuge climatique

## Application React + Flask

```bash
make dev
```

Ouvrir <http://localhost:5173>. Cette commande installe les dépendances,
applique les migrations et lance React/Vite et l'API Flask.
`make frontend-dev` et `make backend-dev` permettent de les lancer séparément.

La nouvelle application se trouve dans `src/web` (React), `src/api` (Flask)
et `src/db` (SQLite et migrations). La base est
`src/db/data/refuge_climatique.sqlite3` et les photos sont dans
`src/db/data/photos/`.

Fonctionnalités disponibles : inscription, connexion, accueil avec annonces
réelles, recherche par texte/type/capacité, catalogue, fiche logement,
publication, équipements et gestion des photos. **Mes logements** permet de
modifier, désactiver, republier et supprimer ses annonces.

Pour essayer : se connecter, publier un logement, ajouter ses photos,
puis ouvrir **Mes logements**. Une annonce désactivée disparaît du catalogue
mais reste modifiable dans cet espace.

Les pages **Favoris** et **Messages** indiquent pour l'instant
« Prochainement ». La carte affiche La Clusaz, sans positions des logements.

Sur une fiche logement, **Documents du logement** donne accès au JSON validé,
à son JSON Schema, à une fiche HTML imprimable et à une version texte.
`make verifier-documents` contrôle les exemples de la nouvelle application.
Voir [le parcours documentaire du logement](src/formats/README.md).

### Essayer les réservations

1. Avec un compte voyageur, ouvrir un logement, choisir les dates et le nombre
   de voyageurs, puis cliquer sur **Demander ce séjour**.
2. Avec le compte qui propose ce logement (dans un autre navigateur ou une
   fenêtre privée), ouvrir le menu du compte → **Demandes reçues**.
3. Accepter ou refuser la demande. Le voyageur retrouve la réponse dans
   **Mes séjours**, avec le bouton **Actualiser** si sa page est déjà ouverte.

Les dates sont bloquées uniquement après acceptation. Les demandes concurrentes
sur cette période sont alors refusées automatiquement. Le départ ne compte pas
comme une nuit occupée : un autre séjour peut commencer ce même jour.
Le voyageur peut annuler jusqu'au jour d'arrivée inclus, ce qui libère les dates.
Le tarif est conservé à la création de la demande, même si l'annonce change ensuite.
L'acceptation génère automatiquement une facture ; aucun paiement n'est déclenché.

### Factures des séjours

Une facture unique est créée dans la même transaction que l'acceptation du séjour.
Son numéro suit le format `FAC-2026-000001`. Elle conserve les informations de
l'émetteur, du client, du logement et du séjour telles qu'elles sont à l'émission.
Les coordonnées non renseignées restent absentes (`null`), sans les inventer.

La commission est de **5 % inclus dans le prix**, prélevés côté propriétaire.
Exemple : le voyageur paie 101,30 €, dont 5,07 € de commission ; il reste 96,23 €
pour le propriétaire. Les lignes de facture décrivent le séjour ; la commission
est une répartition du total, pas un supplément. Tous les calculs utilisent des centimes entiers.
Pour changer le taux des prochaines factures : `export REFUGE_COMMISSION_POURCENT=5`
puis relancer le backend. Les factures déjà émises conservent leur taux.

Dans **Mes réservations**, cliquer sur **Voir la facture** après acceptation :
une fenêtre s'ouvre sans quitter la page, depuis **Mes séjours** ou **Demandes reçues**.
Ses trois onglets présentent la facture imprimable, le JSON et le texte brut.
**Télécharger** enregistre le format sélectionné ; **Exporter XML** fournit le
document XML validé. **Imprimer** imprime uniquement la facture et permet aussi
de choisir « Enregistrer au format PDF » dans la boîte d'impression du navigateur.

Après connexion, `/api/factures` liste les factures et
`/api/factures/FAC-2026-000001` (avec le numéro retourné) fournit le JSON.
La réponse d'une réservation contient également `facture.numero`, `facture.statut`
et `facture.url`. Seuls l'hébergeur et le voyageur concernés y ont accès.
Une annulation conserve la facture et ses montants avec le statut `annulee`.
Le JSON est validé avec `src/formats/json/facture.schema.json`. Le serveur génère
ensuite le XML, le valide avec `src/formats/xml/facture.xsd`, puis applique les
feuilles XSLT de `src/formats/xslt` pour produire le HTML et le texte.
Voir [les formats de documents](src/formats/README.md).

### Peupler la nouvelle base

```bash
make populate COUNT=100 USERS=20 SEED=1
```

Ajoute **100 logements et 20 utilisateurs**, sans supprimer les données présentes.
Environ un tiers des utilisateurs proposent les logements ; les autres restent
clients. Chaque propriétaire généré reçoit au moins une annonce. Les adresses
restent à La Clusaz et les équipements sont tirés dans la liste existante.
Les données sont fictives, sans photos, réservations ni factures.

Les noms, rues, types et fourchettes de prix viennent de
`src/db/seeds/population.json`. Le script Python est dans
`src/api/scripts/populate.py`. Il valide les JSON de saisie et de sortie et
enregistre le lot dans une transaction : une erreur annule tout le lot.

Les comptes générés ont le mot de passe **`RefugeDemo2026!`**. La commande affiche
un email propriétaire et un email client utilisables pour la démonstration.
Les emails suivent le format prénomnom, sans accents ; un suffixe est ajouté
si l'adresse existe déjà. Aucun compte existant n'est modifié.

Chaque exécution **ajoute** le nombre demandé. Avec la même graine sur deux
bases identiques, les valeurs tirées sont les mêmes ; les dates de création et
les empreintes des mots de passe varient. Pour choisir une autre base, ajouter
`NEW_DB=/chemin/vers/demo.sqlite3`.

## Prototype DDS conservé

Le reste de ce document décrit le prototype dans `src/server` et `src/client`.
La nouvelle app possède désormais sa propre facturation de séjour ; l'export XML
global et l’import par LLM du prototype restent à porter.

Application Flask du projet « Ville refuge climatique » (cours DDS). Elle suit
les parcours demandés en cours :

```text
Formulaire → JSON → SQLite → XML → XSLT → HTML / texte imprimable
Texte libre → ILaaS → JSON → SQLite
SQLite → JSON du logement → programme Python → HTML / texte imprimable
```

## Lancer le projet

À la racine du projet :

```bash
make install
export ILAAS_API_KEY="clé_api_du_prof"
.venv/bin/flask --app src.server.app run --debug --port 5001
```

Ouvrir ensuite <http://127.0.0.1:5001>.

## Commandes

| Commande | Utilité |
|---|---|
| `make install` | Crée `.venv` et installe les dépendances |
| `make run` | Lance uniquement la nouvelle API Flask |
| `make dev` | Lance la nouvelle application React + Flask |
| `make populate-legacy COUNT=100 SEED=1` | Génère les factures du prototype et écrit `src/server/data/peuplement.sql` |
| `make verifier` | Vérifie les exemples contre les schémas JSON, DTD et XSD |
| `make drop` | Supprime les tables de la base SQLite |
| `make clean` | Supprime les caches Python, sans toucher à la BDD |
| `make help` | Affiche les commandes disponibles |

La base SQLite est créée automatiquement dans :

```text
src/server/instance/refuge_climatique.sqlite
```

## Peuplement

```bash
make populate-legacy COUNT=100
```

Cette commande remplace les données présentes par le nombre demandé de
factures valides. Les noms, adresses, prix et dates sont combinés à partir des
listes de `src/server/data/population.json`. Avec la même graine (`SEED`), le
jeu de données est identique d'une machine à l'autre.

Chaque facture passe par la validation et l'insertion de l'application. Les
INSERT correspondants sont écrits dans `src/server/data/peuplement.sql`, qui
peut être rejoué sur une base vide.

## Pages et documents produits

| Adresse | Contenu | Technique |
|---|---|---|
| `/` | Liste des factures | Jinja |
| `/factures/nouvelle` | Formulaire de création d'une facture | JSON construit côté navigateur |
| `/import-texte` | Description en texte libre | LLM ILaaS → JSON |
| `/factures/<numero>.xml` | Facture XML du séjour (DTD + feuille de style) | lxml |
| `/factures/<numero>.html` | Facture mise en page | XSLT `facture.xsl` |
| `/factures/<numero>.txt` | Facture imprimable en texte | XSLT `facture-texte.xsl` |
| `/factures.xml` | Toutes les factures dans un seul XML | lxml |
| `/logements` | Liste des logements | Jinja |
| `/logements/<id>.html` | Fiche de présentation d'un logement (RDFa) | Python + Jinja depuis le JSON |
| `/logements/<id>.txt` | Fiche imprimable en texte | Python depuis le JSON |
| `/proprietaires/<id>` | Page d'un propriétaire annotée en RDFa | Jinja |
| `/schema/<fichier>` | DTD, XSD et JSON Schema du projet | — |

API JSON :

| Méthode et adresse | Rôle |
|---|---|
| `POST /api/factures` | Enregistre une facture (validation JSON Schema puis règles métier) |
| `POST /api/factures/depuis-texte` | Texte libre → ILaaS → facture |
| `GET /api/factures/<numero>` | Facture en JSON |
| `DELETE /api/factures/<numero>` | Supprime une facture |
| `DELETE /api/factures` | Supprime toutes les factures |
| `GET /api/logements/<id>` | Logement en JSON (format `logement.schema.json`) |
| `GET /api/population` | Listes servant au bouton « Aléatoire » du formulaire |

## Formats

Le JSON reprend la structure du XML : une clé `@nom` devient un attribut,
`#text` le contenu d'un élément et une liste des éléments répétés. Le même
document existe donc dans les deux formats.

| Fichier | Rôle |
|---|---|
| `schema/logement.schema.json` | JSON Schema de la description d'un logement |
| `schema/facture.schema.json` | JSON Schema de la facture, qui référence (`$ref`) celui du logement |
| `schema/facture.dtd` | DTD de la facture XML |
| `schema/facture.xsd` | XML Schema de la facture XML |
| `schema/base_de_donnees.dtd` / `.xsd` | Modèles de l'export XML complet |
| `examples/` | Un logement, une facture en JSON et la même facture en XML |

Le serveur vérifie le JSON contre le schéma, puis les règles métier : dates
valides, fin de séjour après le début, lignes de facture rattachées à un
logement de l'offre, total égal à la somme des lignes et au montant du séjour.

## XML global et XPath

Le bouton **Télécharger le XML global** génère `base_de_donnees.xml` à partir
de toutes les factures présentes dans SQLite. Le document possède une unique
racine `<base_de_donnees>` contenant les éléments `<facture>` décrits par
`facture.xsd`.

Quelques requêtes à exécuter dans un testeur XPath :

```xpath
//facture[client/nom='Dupont']
//logement[loyer_mensuel > 500]
//facture[@numero='FAC-2026-P000001']/emetteur/email/text()
//logement[environnement_logement/altitude > 1000]/adresse/ville
//activite[type_activite='baignade']/ancestor::logement/@idLogement
count(//facture[sejour/statut='confirme'])
sum(//facture/total)
```

## Organisation

```text
docs/                           # documentation du projet
├── README.md                   # index de la documentation
├── revue-projet.md             # support de la revue de projet
├── presentation.pptx           # diaporama de présentation
├── presentation-gio.pdf        # autre support de présentation
├── choix-de-la-ville.md        # contexte initial du projet
├── sujet/                      # consignes et documents de rendu
├── schemas/                    # schémas et illustrations complémentaires
└── cours/                      # supports fournis en cours

src/
├── client/                     # ce qui est affiché dans le navigateur
│   ├── pages/                  # pages HTML (gabarits Jinja)
│   └── public/
│       ├── css/                # styles
│       └── js/                 # code exécuté dans le navigateur
│
└── server/                     # backend Flask
    ├── app.py                  # création de l'application
    ├── routes/
    │   ├── pages.py            # pages HTML et documents (XML, HTML, texte)
    │   └── api.py              # routes JSON de l'API
    ├── database/
    │   ├── connexion.py        # connexion et initialisation SQLite
    │   ├── factures.py         # lecture des factures
    │   ├── logements.py        # lecture des logements
    │   ├── personnes.py        # lecture des émetteurs et clients
    │   ├── insertion.py        # insertion d'une facture
    │   └── suppression.py      # suppression des factures
    ├── services/
    │   ├── validation.py       # contrôles JSON Schema et métier
    │   ├── documents.py        # facture : JSON → XML, XSLT, validation DTD/XSD
    │   ├── fiche_logement.py   # logement : JSON → HTML / texte (programme)
    │   └── ilaas.py            # appel au LLM
    ├── scripts/
    │   ├── populate.py         # génération des données et du fichier SQL
    │   └── verifier_exemples.py # exemples contre les schémas
    ├── data/
    │   ├── population.json     # listes utilisées pour le peuplement
    │   └── peuplement.sql      # jeu de données généré
    ├── schema/                 # database.sql, DTD, XSD, JSON Schema
    ├── examples/               # facture.json, facture.xml, logement.json
    ├── xslt/
    │   ├── facture.xsl         # facture XML → HTML
    │   └── facture-texte.xsl   # facture XML → texte imprimable
    └── instance/
        └── refuge_climatique.sqlite
```

Le détail des documents disponibles se trouve dans [`docs/README.md`](docs/README.md).

## ILaaS

La partie formulaire fonctionne sans clé. Pour utiliser la page **Texte libre**, définir la variable fournie par le professeur avant le lancement :

```bash
export ILAAS_API_KEY="cle-fournie-par-le-professeur"
.venv/bin/flask --app src.server.app run --debug --port 5001
```

L'adresse par défaut est `https://llm.ilaas.fr/v1`. Une autre adresse peut être utilisée avec :

```bash
export ILAAS_API_URL="https://autre-adresse/v1"
```
