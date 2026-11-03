# Feuille de route — back, BDD et mise en œuvre du cours

> Projet « Refuge climatique » — Documents et Données Structurées (P. Maret, M1 DSC).
> Rédigé le 3 novembre 2026, à partir de l'énoncé, des 8 cours, des notes de séance et du code actuel.

## 0. Ce qu'il faut garder en tête

L'énoncé est explicite : *« Le projet n'a pas pour objectif de réaliser un produit, mais d'appliquer
les concepts du cours. »* Chaque étape ci-dessous doit donc produire **une fonctionnalité utile ET une
démonstration visible d'une notion du cours** (JSON Schema, DTD, XSD, XPath, XSLT, RDFa, liens
hypermédia, convergence documents-données).

Le fil conducteur du cours, à appliquer partout :

> **La base de données est la source de vérité. Les documents (JSON, XML, HTML, RDFa, texte) sont
> des vues générées depuis elle, décrites par un modèle (schéma), validées, puis transformées.**
> Dans l'autre sens, le texte libre est capturé en données structurées (formulaire ou LLM).

Deux exigences de l'énoncé sont faciles à oublier et doivent apparaître dans le code :

1. **La commission** prélevée par la plateforme sur la mise en relation (elle doit figurer sur la facture).
2. **La collectivité pilote et contrôle** : la mairie vérifie et publie les offres, et suit l'activité.

## 1. État des lieux (novembre 2026)

### Avancement du portage DDS — document logement

- [x] Schéma du document JSON public du logement et définitions partagées avec la saisie.
- [x] Validation des annonces publiques relues depuis SQLite avant diffusion.
- [x] Fiche HTML et texte imprimable générés à partir du même JSON validé.
- [x] Accès aux documents depuis la fiche React et commande `make verifier-documents`.
- [x] Fiche publique d'utilisateur annotée en RDFa : l'utilisateur qui propose
      des logements joue le rôle de propriétaire, sans entité distincte.
      Ouverte en fenêtre depuis « Proposé par » (avatar inclus), HTML généré par Flask :
      `/api/utilisateurs/{id}/profil.html`. Nom, prénom, email et téléphone annotés
      avec schema.org ; extraction RDFa vérifiée. Réservée aux utilisateurs ayant
      au moins une annonce publiée.

Ce lot est décrit dans [src/formats/README.md](../src/formats/README.md).
La fiche privée « Mon compte » reste distincte de la fiche publique.
Les éléments ci-dessous constituent la feuille de route initiale ; les cases
de tests, facturation et modération ne sont pas couvertes par ce lot.

### Réservations V1

- [x] Demande de séjour depuis une annonce : dates, voyageurs, JSON Schema,
      prix calculé côté serveur et conservé avec la demande.
- [x] Mes séjours et demandes reçues, acceptation/refus par l'hôte, annulation
      par le voyageur jusqu'au jour d'arrivée inclus.
- [x] Contrôle des chevauchements en transaction, refus automatique des demandes
      concurrentes à l'acceptation, vérification de deux acceptations simultanées.
- [x] Vérification API et navigateur sur base temporaire, sans modifier les données existantes.
- [ ] Plages d'ouverture explicites : pour l'instant, publié = réservable hors séjours acceptés.
- [x] Facturation backend à l'acceptation : numéro annuel unique, contexte figé,
      lignes d'hébergement, commission de 5 % incluse côté propriétaire,
      validation JSON et règles de cohérence, consultation privée via l'API.
      Annulation du séjour = facture conservée avec statut `annulee`.
- [x] Factures de la nouvelle app : export XML validé par XSD, transformation
      XSLT côté serveur en HTML et texte. Aperçu React depuis les réservations :
      onglets imprimable/JSON/texte, téléchargements HTML/JSON/TXT/XML et impression.
      Accès limité aux deux parties, y compris après annulation.
      DTD, XML global et transformation XSLT côté navigateur restent à porter.

### Préremplissage des logements par texte libre

- [x] Zone « Décrivez votre logement » sur la page de publication, appel ILaaS
      côté serveur, JSON partiel validé avec des définitions partagées.
- [x] Formulaire prérempli et modifiable ; les valeurs absentes restent à compléter,
      les valeurs saisies et non remplacées sont conservées. Publication séparée,
      avec le schéma complet et les contrôles existants.
- [x] Vérification sur base temporaire et fournisseur simulé : erreurs, données
      partielles, absence d'écriture avant publication, parcours navigateur.
- [ ] Vérifier l'extraction avec une clé ILaaS réelle dans l'environnement de démonstration.

### Vue d'ensemble initiale

| Bloc | État | Remarque |
|---|---|---|
| Front React (`src/web`) | ✅ Refait selon `docs/Design.md` | On n'y touche plus, sauf pour brancher les nouvelles API |
| API Flask (`src/api`) | 🟡 Auth + logements + photos | Bonne architecture (routes → services → repositories), JSON Schema en entrée |
| BDD (`src/db`) | 🟡 Migrations 001–003 | Tables `reservation`, `facture`, `ligne_facture`, `favori`, `disponibilite` créées mais **inutilisées** |
| Prototype (`src/server`, `src/client`) | 🟠 Rendus 1–4 faits sur un **ancien modèle** | `loyer_mensuel`, `depot_garantie`… : modèle de location au mois, incohérent avec des nuitées |
| Tests | ❌ Aucun | Indispensable pour prouver que les documents sont **valides** |

**Décision** : on **porte** les livrables du prototype dans la nouvelle application, en les réalignant
sur le vrai modèle (séjour à la nuit, commission, mairie). Le prototype sert de référence puis est
supprimé à la fin (étape 10). Rien n'est perdu : son historique Git reste.

## 2. Vue d'ensemble des étapes

| # | Étape | Rendu visé | Priorité |
|---|---|---|---|
| 1 | Socle : tests, organisation des formats, données de démo | tous | 🔴 |
| 2 | Modèle de données complet | Rendus 2 et 3 | 🔴 |
| 3 | Réservations, factures, commission, modération mairie | Rendu 2 | 🔴 |
| 4 | Formats v2 : JSON Schema du logement, DTD + XSD de la facture | Rendu 1 | 🔴 |
| 5 | Programmes : texte libre → LLM → JSON → BDD, facture XML depuis la BDD | Rendu 2 | 🔴 |
| 6 | Liaisons hypermédia entre les données | Rendu 2 | 🟠 |
| 7 | Peuplement, page propriétaire RDFa, XML global + console XPath | Rendu 3 | 🔴 |
| 8 | Transformations XSLT (facture et logement, écran + impression) | Rendu 4 | 🔴 |
| 9 | Aller plus loin : météo, canicule, points d'intérêt, tableau de bord mairie | bonus | 🟢 |
| 10 | Nettoyage, documentation des rendus, revue de projet | Rendu 4 | 🔴 |

Les étapes 1 → 4 sont séquentielles. Ensuite 5, 6, 7 et 8 peuvent être réparties entre les
membres du groupe. Chaque étape se termine par un commit propre et des tests verts.

---

## Étape 1 — Socle technique

**Objectif** : pouvoir avancer vite sans casser, et regrouper tous les formats au même endroit.

- [ ] Ajouter `pytest` à `requirements.txt` ; créer `tests/` avec une fixture qui crée une **BDD
      temporaire migrée** et un client Flask de test ; cible `make test`.
- [ ] Créer un dossier unique pour les formats du cours :
      ```text
      src/formats/
      ├── json/        logement.schema.json, defs/ (adresse, personne, geo…)
      ├── xml/         facture.dtd, facture.xsd, base.dtd, base.xsd
      ├── xslt/        facture-html.xsl, facture-impression.xsl, facture-texte.xsl, logement-*.xsl
      └── examples/    un exemple valide de chaque document
      ```
      Les schémas d'entrée de l'API (`src/api/schemas/*.json`) réutilisent les définitions communes
      via `$ref`, au lieu de les recopier.
- [ ] Route `GET /api/formats/<fichier>` qui sert les schémas et feuilles XSLT (utile pour la revue
      et pour l'instruction `<?xml-stylesheet?>`).
- [ ] Script `make seed` : 3 comptes de démo (voyageur, propriétaire, agent mairie) + quelques logements.
- [ ] Test générique : **chaque fichier de `examples/` est valide contre son schéma** (remplace
      `make verifier` du prototype).

**Fini quand** : `make test` passe, et `make seed` donne une app utilisable en 1 commande.

---

## Étape 2 — Modèle de données complet

**Objectif** : répondre à « Compléter le schéma de la BD » (rendu 3) et couvrir tout l'énoncé.

Nouvelles migrations (une migration appliquée n'est jamais modifiée) :

- [ ] **004 – Rôle mairie et modération**
      - `utilisateur.role` : ajouter `mairie` (SQLite : il faut reconstruire la table pour changer un `CHECK`).
      - `logement.statut` : ajouter `en_verification` et `refuse` ; colonnes `motif_refus`,
        `date_validation`, `valide_par_id` (FK utilisateur).
      - Cycle de vie : `brouillon → en_verification → publie ⇄ indisponible`, ou `→ refuse`.
- [ ] **005 – Caractéristiques « refuge »** (ce qui différencie le projet d'Airbnb)
      - `logement` : `latitude`, `longitude`, `altitude_m`, `etage`, `accessible_pmr`,
        `niveau_fraicheur` (`frais`, `tempere`, `chaud`), `tarif_solidaire` (booléen).
      - Ces champs alimentent la carte, la météo et le RDFa (GeoCoordinates).
- [ ] **006 – Réservation enrichie**
      - `reservation.motif` (`canicule`, `evenement`, `autre`) : les 3 motifs d'usage des notes de séance.
      - `reservation.ville_origine` : pour comparer la météo de départ et celle de La Clusaz.
      - `reservation.date_decision`, `reservation.message_demandeur`.
- [ ] **007 – Facturation et commission**
      - Table `parametre` (clé/valeur) : `taux_commission` (ex. 5 %), `taxe_sejour_centimes` par
        personne et par nuit (montant réel à vérifier auprès de la commune), `prochain_numero_facture`.
      - `ligne_facture.type` : `hebergement`, `taxe_sejour`, `commission`, `remise_solidaire`.
      - `facture` : `sous_total_centimes`, `commission_centimes`, `taux_commission` (figé à l'émission).
- [ ] **008 – Contenus du refuge climatique** (énoncé : « informations météorologiques, services disponibles »)
      - `point_interet` : `type` (`point_eau`, `lieu_frais`, `pharmacie`, `centre_soin`, `transport`,
        `commerce`, `activite`), `nom`, `adresse`, `latitude`, `longitude`, `horaires`, `telephone`,
        `source` (ex. OpenStreetMap).
      - `releve_meteo` : `ville`, `date`, `t_min`, `t_max`, `source`, `date_collecte` (cache de l'API météo).
      - `episode_canicule` : `date_debut`, `date_fin`, `niveau`, `villes_concernees`, `cree_par_id`.
- [ ] Mettre à jour `docs/schemas/schema-bdd-v1.dbml` → `schema-bdd-v2.dbml` et régénérer le
      diagramme (dbdiagram.io) ; l'ajouter à la doc du rendu 3.

**Notions du cours** : convergence documents-données (le SGBD gère la persistance, les documents
sont produits depuis lui), contraintes d'intégrité (clés étrangères, `CHECK`, unicité).

**Fini quand** : migrations appliquées sur une base vide sans erreur + test d'intégrité
(insertion invalide refusée par chaque `CHECK`).

---

## Étape 3 — Fonctionnalités cœur : réservation, facture, commission, mairie

**Objectif** : que la base contienne de **vrais séjours et de vraies factures**, indispensables pour
les rendus 2, 3 et 4.

Toujours la même architecture : `routes/` (HTTP) → `services/` (règles) → `repositories/` (SQL).

- [ ] **Disponibilités** (propriétaire) : `GET/POST/DELETE /api/logements/{id}/disponibilites`.
- [ ] **Réservations**
      - `POST /api/reservations` (voyageur) : JSON Schema `reservation.schema.json` + règles métier :
        logement publié, capacité respectée, dates dans une disponibilité, **pas de chevauchement**
        avec une réservation acceptée, prix de la nuit **figé** au moment de la demande.
      - `GET /api/reservations` (mes séjours) et `GET /api/reservations/recues` (propriétaire).
      - `PATCH /api/reservations/{id}` : `acceptee` / `refusee` (propriétaire), `annulee` (voyageur),
        `terminee` (automatique après la date de fin).
- [ ] **Facture** : générée **automatiquement à l'acceptation**, dans une transaction :
      - lignes `hebergement` (nuits × prix), `taxe_sejour` (personnes × nuits × tarif),
        `commission` (taux × hébergement), éventuelle `remise_solidaire` ;
      - numéro séquentiel `FAC-2026-000123` ; total = somme des lignes (vérifié par un test).
      - `GET /api/factures` (les miennes) et `GET /api/factures/{numero}` (JSON).
- [ ] **Modération mairie** : `GET /api/mairie/logements?statut=en_verification`,
      `PATCH /api/mairie/logements/{id}` (valider / refuser avec motif). Une annonce n'est visible
      au catalogue qu'après validation.
- [ ] **Favoris** : `PUT/DELETE /api/favoris/{logementId}`, `GET /api/favoris`.
- [ ] Front (minimal, plus tard) : bouton « Demander à réserver », pages Réservations et Favoris
      (aujourd'hui « Bientôt »), page Mairie.

**Fini quand** : scénario de test complet « publier → valider (mairie) → réserver → accepter →
facture émise avec commission » qui passe en un seul test d'intégration.

---

## Étape 4 — Formats v2 (Rendu 1, refait proprement)

**Objectif** : des formats qui décrivent **notre** modèle et qui utilisent **toutes les notions
vues en cours**, avec un tableau qui le prouve.

### 4.1 JSON + JSON Schema du logement

- [ ] `src/formats/json/logement.schema.json` (draft 2020-12) = **le format public de la description
      d'un logement**. La réponse de `GET /api/logements/{id}` doit **être** ce document (testé).
- [ ] Utiliser les notions du cours, chacune à un endroit justifié :

| Notion (cours JSON) | Où l'utiliser |
|---|---|
| `title`, `description`, `type`, `properties`, `required` | partout |
| `$id` et `$ref` vers un autre schéma | `defs/adresse.schema.json`, `defs/personne.schema.json` |
| `enum` | `typeLogement`, `niveauFraicheur`, `statut` |
| `const` | `adresse.ville = "La Clusaz"` |
| `pattern` | code postal `^74220$`, téléphone, numéro de facture |
| `minimum` / `exclusiveMinimum` / `maximum` | capacité (> 0), prix (≥ 0), altitude |
| tableau `items` + `uniqueItems`, `minItems`/`maxItems` | équipements, photos (≤ 8) |
| tuple `prefixItems` + `items: false` | `coordonnees: [latitude, longitude]` |
| `contains` | au moins une photo de type couverture (si pertinent) |
| `null` / booléens | `telephone` facultatif, `accessiblePmr`, `tarifSolidaire` |
| `format` (`email`, `date`, `uri`) | email du propriétaire, dates, URLs des photos |

- [ ] Un exemple complet `examples/logement.json` + un contre-exemple invalide commenté (montre
      ce que le schéma refuse).

### 4.2 XML + DTD + XSD de la facture

- [ ] Nouveau contenu, aligné sur les nuitées : `plateforme` (émetteur, au nom de la commune),
      `proprietaire`, `client`, `sejour` (dates, nuits, voyageurs, motif), `logement`, `lignes`
      (avec `type` et `refLogement`), `sous_total`, `commission`, `taxe_sejour`, `total`, `paiement`.
- [ ] **DTD** `facture.dtd` : entité paramètre `%personne;`, entité générale `&plateforme;`,
      `ATTLIST` avec énumérations, `#REQUIRED`/`#IMPLIED`/`#FIXED` (`devise "EUR"`), `ID`/`IDREF`
      (ligne → logement), opérateurs `? * + |`.
- [ ] **XSD** `facture.xsd` : montrer ce que la DTD ne sait pas faire (dernière diapo du cours XML) :

| Notion (cours XSD) | Où l'utiliser |
|---|---|
| types simples (`date`, `decimal`, `positiveInteger`, `anyURI`) | dates, montants, nombre de nuits |
| `complexType` + `sequence` / `choice` / `all` | `adresseType` ; `paiement` = `choice(carte, virement, gratuit)` |
| `restriction` + `pattern` | numéro `FAC-\d{4}-\d{6}`, code postal |
| `restriction` + `enumeration` | statut, type de ligne, motif |
| `extension` | `proprietaireType` étend `personneType` (ajoute `idProprietaire`) |
| `list` | `equipements` = liste de jetons |
| `ref` et réutilisation | éléments `adresse`, `email` déclarés une fois |
| espace de noms (`targetNamespace`) | `https://refuge-laclusaz.fr/ns/facture` |
| **`xs:key` / `xs:keyref`** | contrainte typée ligne → logement : **corrige la limite des IDREF** citée en cours |
| `include` / `import` | `base.xsd` (étape 7) inclut `facture.xsd` |

- [ ] Validation **DTD et XSD** dans le code avec `lxml`, et tests qui valident chaque facture générée.

**Fini quand** : tableau ci-dessus rempli dans `docs/rendus/rendu-1.md`, exemples valides,
contre-exemples refusés, tests verts.

---

## Étape 5 — Programmes du rendu 2

### 5.1 Texte libre → LLM (ILaaS) → JSON → BDD

- [ ] `POST /api/logements/analyse` : reçoit une description libre, renvoie un **brouillon JSON
      conforme** au schéma de création.
      - Prompt = consigne + JSON Schema + exemple (reprendre `src/server/services/ilaas.py`).
      - **Boucle de réparation** (aller plus loin) : si la réponse est invalide, renvoyer au LLM les
        erreurs de validation (2 essais max).
      - Le brouillon n'est **jamais inséré sans relecture** : le front pré-remplit le formulaire de
        publication existant, l'utilisateur corrige, puis `POST /api/logements`.
      - Sans clé `ILAAS_API_KEY` : erreur claire. Dans les tests : LLM simulé.
- [ ] Journaliser chaque extraction (texte source, JSON produit, valide ou non) pour la démo et la
      revue (« capturer des données via des LLM », cours Convergence).

### 5.2 Facture XML depuis la BDD

- [ ] `GET /api/factures/{numero}.xml` : construit le XML **depuis SQLite** (lxml), avec `DOCTYPE`
      et instruction `<?xml-stylesheet?>`, validé DTD + XSD avant envoi.
- [ ] Interface simple de sélection du séjour (exigence de l'énoncé) : page « Mes réservations »
      → bouton « Facture » ; côté mairie, liste filtrable de tous les séjours.

**Fini quand** : démo « je colle un texte → formulaire pré-rempli → publié » et « je choisis un
séjour → je télécharge sa facture XML valide ».

---

## Étape 6 — Liaisons hypermédia entre les données

**Objectif** : répondre à « proposez l'insertion de liaisons entre les différentes données de la
base » (rendu 2), en appliquant le cours Convergence / Hypermédia (nœuds typés, liens typés,
points d'entrée).

- [ ] **Graphe documenté** dans `docs/rendus/rendu-2.md` : nœuds (logement, propriétaire,
      réservation, facture, point d'intérêt, équipement) et liens typés (`proposePar`, `concerne`,
      `facturePour`, `aProximiteDe`, `possede`, `voirAussi`).
- [ ] **JSON** : chaque ressource de l'API porte un objet `_links` (style HAL) avec des relations
      typées, décrit dans le JSON Schema :
      ```json
      "_links": {
        "self":         {"href": "/api/logements/12"},
        "proprietaire": {"href": "/api/proprietaires/4"},
        "reservations": {"href": "/api/logements/12/reservations"},
        "aProximite":   {"href": "/api/points-interet?pres=12"}
      }
      ```
- [ ] **XML** : références `ID`/`IDREF` à l'intérieur d'un document, et liens entre documents avec
      **XLink** (`xlink:type="simple" xlink:href="…" xlink:role="…"`) dans la facture et l'export.
- [ ] **HTML** : pages croisées (logement ↔ propriétaire ↔ autres logements du même propriétaire
      ↔ points d'intérêt proches), liens typés avec l'attribut `rel`.
- [ ] Aller plus loin : **JSON-LD** schema.org dans les pages HTML (même sémantique que le RDFa,
      autre syntaxe, citée dans le cours RDFa).

---

## Étape 7 — Rendu 3 : peuplement, RDFa, XML global, XPath

### 7.1 Peupler la BDD

- [ ] `make populate COUNT=… SEED=…` : générateur **déterministe** (même graine = mêmes données)
      qui passe par **les services** (donc les règles métier sont respectées) :
      ~30 propriétaires, ~80 logements, ~300 voyageurs, ~1 000 réservations, plusieurs centaines
      de factures, sur plusieurs épisodes de canicule.
- [ ] Données réalistes : vraies rues de La Clusaz, villes d'origine de la région (Annecy, Lyon,
      Annemasse, Genève, Grenoble…), points d'intérêt importés d'**OpenStreetMap** (données ouvertes).
- [ ] Écrire aussi `src/db/seeds/peuplement.sql` (rejouable sur une base vide), comme demandé
      dans « Détails des devoirs ».

### 7.2 Page propriétaire HTML + RDFa

- [ ] Route **rendue côté serveur** (Jinja) `GET /proprietaires/{id}` : le RDFa doit être dans le
      HTML envoyé, pas ajouté par React, sinon les validateurs ne le voient pas.
- [ ] Vocabulaire schema.org, comme dans les exemples du cours : `vocab`, `typeof`, `property`.
      `Person` (givenName, familyName, email, telephone, address → `PostalAddress`),
      `makesOffer` → `Offer` → `itemOffered` → `Accommodation`/`House`/`Apartment`
      (`numberOfRooms`, `occupancy`, `geo` → `GeoCoordinates`, `amenityFeature`), prix
      (`PriceSpecification`, `priceCurrency`).
- [ ] Même chose pour la fiche logement publique.
- [ ] Validation : **Schema Markup Validator** (validator.schema.org, successeur de l'outil Google
      cité en cours), Google Rich Results Test et W3C RDFa ; captures dans la doc.
- [ ] Test automatique : extraire le RDFa de la page (bibliothèque `extruct`) et vérifier les
      triplets attendus.

### 7.3 XML de toute la BDD + XPath

- [ ] `GET /api/export/base.xml` : racine unique `<base_de_donnees>` contenant **toutes les
      factures** au format de `facture.xsd` (exigence des « Détails des devoirs »), plus les sections
      `personnes` et `logements` référencées par `ID`/`IDREF`. Validé par `base.xsd`
      (`xs:include` de `facture.xsd`) et `base.dtd`.
- [ ] **Console XPath dans l'application** : `POST /api/xpath` (lecture seule, sur le XML généré,
      résultat limité) + petite page front « Interroger les données ». Montrer les 4 types de
      résultat du cours : nœud, ensemble de nœuds, valeur, rien.
- [ ] Catalogue d'au moins 15 requêtes commentées dans `docs/rendus/rendu-3.md`, qui couvrent :
      chemins absolus et relatifs, axes (`ancestor::`, `following-sibling::`, `parent::`),
      prédicats (`[1]`, `[last()]`, conditions), attributs, `text()`, fonctions (`count`, `sum`,
      `contains`, `starts-with`, `id()`), par exemple :
      ```xpath
      //facture[client/nom='Dupont']
      //facture[@numero='FAC-2026-000042']/proprietaire/email/text()
      //facture[sejour/motif='canicule'][total > 300]/@numero
      sum(//facture/ligne[@type='commission']/montant)
      //logement[altitude > 1100]/ancestor::facture/client/adresse/ville
      count(//facture[sejour/ville_origine='Lyon'])
      ```
- [ ] Tester aussi dans un testeur XPath en ligne (exigence de l'énoncé), avec captures.

---

## Étape 8 — Rendu 4 : transformations XSLT

### 8.1 Facture XML → HTML (écran) et format imprimable différent

- [ ] `facture-html.xsl` : page de facture pour l'écran, servie par `GET /api/factures/{n}.html`
      (transformation **côté serveur** avec lxml).
- [ ] La même facture ouverte en `.xml` dans le navigateur est transformée **côté client** grâce
      à `<?xml-stylesheet?>` : montrer les deux.
- [ ] Format imprimable **différent** : `facture-impression.xsl` → HTML A4 noir et blanc (`@page`)
      et `facture-texte.xsl` → texte brut.
      Aller plus loin : **XSL-FO → PDF** (Apache FOP), le format d'impression natif de la famille XSL.
- [ ] Couvrir les instructions du cours et au-delà : `template match`, `apply-templates select`,
      `value-of`, `text`, puis `for-each`, `sort`, `if`/`choose`, `variable`, `format-number`,
      `xsl:key` + `key()` pour résoudre les `IDREF`.

### 8.2 Présentation d'un logement (JSON)

Le cours pose la question : *« Pour JSON, faut-il utiliser XSLT ? »* On montre **les deux options**
et on argumente :

- [ ] **Option 2 du cours (retenue)** : programme Python qui lit le JSON du logement et produit la
      fiche HTML et la fiche imprimable (Jinja) : `GET /logements/{id}.html` et `.txt`.
- [ ] **Option 1** : JSON → XML (conversion générique) → `logement-html.xsl`. Comparer longueur,
      lisibilité et maintenance dans la doc (« avantages et inconvénients », cours XSLT).

---

## Étape 9 — Aller plus loin : le « refuge climatique » pour de vrai

Ce qui distingue le projet d'une simple copie d'Airbnb et répond à l'énoncé (« informations
météorologiques, services disponibles ») et au point ouvert de `choix-de-la-ville.md`.

- [ ] **Météo comparée** : API **Open-Meteo** (gratuite, sans clé) → `releve_meteo`.
      `GET /api/meteo?origine=Lyon` : températures minimales nocturnes prévues à La Clusaz et dans la
      ville d'origine, et l'écart. Affichée sur la fiche logement et à la réservation.
- [ ] **Justifier le choix de La Clusaz avec des données** : historique Open-Meteo (archive) des
      nuits des canicules 2019, 2022 et 2023, La Clusaz comparée à Lyon et Annecy → graphique + tableau
      dans la doc (répond au « point à vérifier » de `choix-de-la-ville.md`).
- [ ] **Épisode de canicule** : la mairie déclare un épisode (ou détection par seuils de
      températures) → les logements disponibles sont mis en avant, tarif solidaire possible.
- [ ] **Points d'intérêt** : import OpenStreetMap (Overpass) → `point_interet` ;
      `GET /api/points-interet` au format **GeoJSON** (un format de données structurées de plus) ;
      affichage sur la page Carte.
- [ ] **Tableau de bord mairie** : requêtes SQL agrégées (places disponibles, nuitées par épisode,
      répartition par ville d'origine, commissions perçues) ; export **CSV** et **JSON**
      (« formats d'export des SGBD », cours Convergence).
- [ ] **Interopérabilité** : flux public des offres en JSON/XML pour qu'un tiers (site de la
      préfecture, open data) les republie (« la diffusion des modèles permet des échanges entre
      applications »).

---

## Étape 10 — Nettoyage, documentation et revue de projet

- [ ] Supprimer `src/server` et `src/client` une fois tout porté ; mettre à jour `Makefile` et
      `README.md` (une seule app, une seule base).
- [ ] `docs/rendus/rendu-1.md` … `rendu-4.md` : pour chacun, **consigne → ce qu'on a fait →
      fichiers → comment le tester → captures**.
- [ ] `docs/correspondance-cours.md` : **matrice notion du cours → fichier → démonstration**.
      C'est le document le plus utile pour le prof : il montre que chaque notion est appliquée.
- [ ] Recherche « l'existant et notre différence » (Airbnb, plans canicule, logement d'urgence,
      numéros verts) avec sources, comme demandé dans les notes de séance.
- [ ] Scénario de démo de 10 minutes (ci-dessous) + diaporama.

### Scénario de démo proposé

1. La mairie déclare un épisode de canicule ; la météo montre l'écart de température Lyon / La Clusaz.
2. Un habitant colle un texte libre → le LLM produit le JSON → validation par le schéma → publication.
3. La mairie valide l'annonce ; elle apparaît au catalogue (page logement avec RDFa validé).
4. Un réfugié réserve ; le propriétaire accepte → facture émise avec commission.
5. Facture : XML (DTD + XSD valides) → HTML écran → version imprimable.
6. Export XML de toute la base → requêtes XPath en direct.
7. Matrice de correspondance avec le cours.

---

## Annexe — Règles de travail pour le groupe

- Une migration appliquée ne se modifie jamais : on en ajoute une nouvelle.
- Pas de SQL dans les routes, pas de Flask dans les repositories (voir `src/api/README.md`).
- Tout document produit (JSON, XML, HTML RDFa) a **un schéma et un test de validation**.
- Montants en **centimes** (entiers) dans la BDD ; conversion en euros seulement dans les documents.
- Un commit par tâche cochée, message au format `type(portée): description`.
