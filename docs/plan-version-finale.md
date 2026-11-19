# Refuge climatique de La Clusaz — plan de réalisation de la version finale

**Périmètre de la revue du 19 novembre 2026.** La révision `1b26573` de la branche `final-version` fournit le point de comparaison. Le dossier de travail contient déjà des ajouts au-delà de cette révision. Le tableau de reprise ci-dessous indique lesquels réutiliser. Les cases des lots servent à prononcer leur réception sur la version livrée.

**Résultat attendu** — Une personne qui envisage de quitter son logement pendant une forte chaleur peut répondre, avant de réserver, à trois questions concrètes. Quelles protections l’hébergeur déclare-t-il ? Quelles températures extérieures sont prévues à La Clusaz pendant mon séjour ? Depuis cette adresse, où trouver de l’eau potable, une pharmacie, un transport ou un lieu de baignade accessible ? Le professeur doit pouvoir suivre l’origine d’une réponse depuis la source jusqu’à l’écran, puis retrouver cette même information sous forme structurée.

**Choix de périmètre** — Garder React, Flask, SQLite et les parcours de séjour actuels. Enrichir trois écrans publics existants, la fiche, la carte et l’accueil/catalogue. Ajouter un seul espace privé, celui de la mairie. Investir le temps dans la qualité des données, les relations entre documents et les preuves de validation.

## Livraison du 19 novembre 2026

Les huit lots ci-dessous ont été réalisés sur la branche de travail. La [revue finale](revue-projet.md) donne les comptes, les captures des validateurs, les expressions XPath et le scénario de soutenance. Pour préparer une base fictive distincte, lancer `make dev-demo`. Pour contrôler les documents en lecture seule sur cette base, lancer `make verifier-documents`.

| Contrôle de livraison | Résultat constaté |
|---|---|
| Mise à niveau et installation neuve | La migration 004 → 006 sur une copie a conservé les 23 utilisateurs, 103 logements, 3 réservations et la facture initiale. Une installation neuve génère la démo et passe le vérificateur. |
| Parcours depuis le navigateur | Publication manuelle avec adresse IGN, période ouverte, demande dans une deuxième session, acceptation, commission incluse et annulation. Sur mobile, consultation du territoire et téléchargement du XML par la mairie. |
| Sources et droits | Trois fiches géolocalisées ont été comparées au GeoJSON et au graphe. L’import conserve les lieux municipaux. La révocation prend effet dans la session ouverte. Une suspension masque aussi les photos et la carte. |
| Rendus pédagogiques | Deux exports validés. Les 101 factures de la collection concordent avec les documents individuels. Requêtes XPath exécutées en ligne sur les deux exports, profil et fiche passés dans le validateur de balisage. |
| Préremplissage | Proposition partielle valide, champs étrangers refusés, absence de clé et formulaire manuel exercés. Une démonstration avec réponse réelle d’ILaaS dépend d’une clé active du cours. |

## État de reprise avant la recette finale

**Premier parcours à finaliser.** Ouvrir deux annonces fictives de la base de démonstration et expliquer pourquoi leurs alentours conduisent à des choix différents pendant une forte chaleur. La fiche n° 100, près du centre, retrouve la pharmacie du Danay à 123 m à vol d’oiseau. La fiche n° 99, aux Confins, retrouve le lac à 490 m, mesurés jusqu’au point représentant le lac. Aucune pharmacie n’est renvoyée dans son rayon de 2 km. Cela renseigne sur les données recensées et la méthode de calcul. Une décision sur la baignade ou sur le trajet à pied demanderait une autre source.

| Priorité | Déjà présent dans le dossier de travail | Prochaine action et preuve de fin |
|---|---|---|
| 1 · Voyageur et données liées | Suggestions IGN, altitude, ombrage, équipements, import des lieux, carte GeoJSON, proximité par logement, météo et graphe JSON-LD | Sur les fiches 99 et 100, suivre chaque lieu de la liste à la carte et au graphe, vérifier le même identifiant et la distance. Rejouer avec une annonce sans coordonnées. Vérifier le HTML réellement fourni au validateur, en plus de la navigation React. Conserver les deux exemples pour l’oral. |
| 2 · Hébergeur et mairie | Disponibilités, favoris, habilitation mairie, suspension et gestion des lieux municipaux figurent dans le code. La réservation, la facture et l’aide à la saisie existaient dans la révision de départ. | Rejouer un séjour entre deux comptes. Refuser une période fermée, accepter une demande autorisée et ouvrir la même facture chez les deux parties. Vérifier qu’un tiers ne peut la lire et que seule la mairie exporte la collection. Sur une annonce suspendue, contrôler aussi la carte et l’accès direct. |
| 3 · Rendus du cours | Deux feuilles XSLT pour le logement, rendus de facture, deux exports XML, RDFa du profil et captures de validation présentes | Relier chaque preuve à son document d’entrée. Étendre le vérificateur actuel, limité à trois exemples JSON. Tester une rupture de structure en DTD, une mauvaise date en XSD, un filtre XPath sur les factures et un autre sur le territoire. Enregistrer expression, résultat et document utilisé. |
| 4 · Reproductibilité | Les migrations 005 et 006, un import local, des extraits IGN/OSM/météo et une commande de démo existent | Aligner le DBML, le README et la revue avec ces migrations. Documenter dates, emprise et attributions. Refaire le démarrage depuis une base dédiée vide, puis la démo en mode dégradé. Consigner le résultat d’un vrai appel ILaaS si la clé est disponible. |

**Ce que signifie « beaucoup de données » dans ce projet.** Le comptage en lecture seule de la base de démonstration donne 20 utilisateurs fictifs, 100 logements, 103 réservations, 101 factures, 3 logements géolocalisés et 164 lieux territoriaux actifs. Ces derniers se répartissent entre 108 objets de transport, 29 points d’eau, 21 commerces alimentaires, 3 pharmacies, 2 objets de piscine et 1 lac. L’emprise inclut les abords de la commune. Deux objets de piscine peuvent décrire un bassin et son établissement. Présenter ces nombres comme des objets cartographiés. Une catégorie municipale « lieu de fraîcheur » peut rester vide jusqu’à ce qu’une source locale confirme un lieu et ses conditions d’accès.

**Décision pour les fournisseurs.** L’IGN donne la position d’une adresse, Overpass permet d’importer un catalogue territorial depuis OpenStreetMap et Open-Meteo fournit les températures extérieures datées. La mairie peut compléter les lacunes avec des faits vérifiés. Google Places impose d’activer la facturation et applique des tarifs selon les opérations. Pour ce TP, le choix des sources ouvertes permet surtout de livrer un extrait daté, de l’interroger hors ligne et de reproduire la démonstration. [Géocodage IGN](https://cartes.gouv.fr/aide/fr/guides-utilisateur/utiliser-les-services-de-la-geoplateforme/geocodage/), [Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API), [Open-Meteo](https://open-meteo.com/en/docs), [fonctionnement de Google Places](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing).

## 1. Ce que les sources du projet demandent

| Origine | Attendu pour la soutenance | Réponse retenue |
|---|---|---|
| Sujet général | Une collectivité peut piloter les offres sur un territoire, avec hébergeurs, demandeurs, commission, météo et services | Parcours de réservation existant + administration des données du territoire + contexte climatique par adresse |
| Rendu 1 | Description JSON du logement avec JSON Schema. Facture XML avec DTD et XSD | Étendre les schémas du logement. Garder une facture de séjour et prouver les deux validations sur le même document |
| Rendu 2 | BDD, saisie libre vers JSON puis insertion, liaisons navigables, facture depuis un séjour choisi | Conserver la relecture du formulaire avant publication. Relier annonce, lieux, carte, hôte, séjour et facture |
| Rendu 3 | Schéma BDD complété, base peuplée, HTML propriétaire en RDFa, XML global et requêtes XPath en ligne | Actualiser DBML et export. Produire plusieurs factures sur base de démo. Livrer des requêtes rejouées et leurs résultats |
| Rendu 4 | XSLT pour produire des présentations différentes de la facture et présentation équivalente du logement à partir du JSON. Revue de projet | Facture déjà transformée. Pour lever l’ambiguïté du « idem » du sujet, réaliser aussi les rendus du logement par XSLT depuis une projection XML du JSON validé |
| Notes de séance du groupe | Informations locales actualisées, chaleur passée/actuelle/prévue, loisirs, santé, eau, transports | Une vue communale alimentée et des résultats géographiques propres à chaque logement |
| Dernier retour oral rapporté | Montrer le refuge climatique, la variété des données et le **JSON-LD des lieux autour d’un logement** | Démontrer deux logements dont les alentours diffèrent. Ouvrir le HTML livré par Flask et extraire les lieux identifiés en JSON-LD |

Les règles de rayon, le choix des fournisseurs, les volumes de démonstration et le niveau de détail de l’administration sont des décisions de réalisation proposées ici. Les quatre rendus proviennent du [sujet officiel](<Projet M1 Doc Num Refuge climatique.pdf>). Voir aussi les [précisions sur le peuplement, RDFa et XPath](sujet/details-des-devoirs-donnee-structuree.pdf), les [notes de séance](sujet/documents-de-rendu.pdf) et le [choix de La Clusaz](sujet/choix-de-la-ville.md).

## 2. Inventaire de référence au commit `1b26573`

| Élément | Ce qui existe vraiment | Travail restant |
|---|---|---|
| Comptes | Inscription en `client`, session Flask, passage en `proprietaire` lors de la première publication. Un propriétaire peut aussi voyager | Ajouter une habilitation mairie indépendante. Tester la promotion, les droits par objet et la navigation mobile |
| Annonces | Création, modification, photos, équipements, désactivation/republication, recherche et liste personnelle. Les schémas exigent déjà « La Clusaz » et 74220 | Distinguer une adresse saisie d’une adresse localisée précisément. Ajouter les caractéristiques contre la chaleur |
| Carte | Iframe OpenStreetMap avec marqueur fixe du village | Remplacer le repère par les logements publiés et les services réellement localisés |
| Préremplissage | ILaaS → JSON partiel validé → proposition éditable → POST de publication | Tester une fois le vrai fournisseur avec la clé configurée. Empêcher toute proposition de coordonnées, altitude, météo et services. Préserver les champs absents |
| Demandes | Deux espaces de réservation, contrôle des droits, dates, capacité, refus des chevauchements et tarif figé | Rejouer les cas limites après migration. Achever les disponibilités explicites de l’hôte avec une règle compatible avec les annonces actuelles |
| Factures | Émission dans la transaction d’acceptation, numéro unique, identités figées, lignes en centimes, commission incluse côté hôte, annulation conservée. Aperçu et téléchargements HTML, JSON, texte et XML | Préparer plusieurs cas de démonstration et vérifier le peuplement, la facture privée et la collection exportée |
| Documents du logement | JSON public validé + HTML imprimable et texte via Python/Jinja | Alimenter toutes les sorties depuis le même document enrichi et achever les transformations du rendu 4 |
| Données liées | Le profil HTML public utilise déjà le RDFa `Person`. La fiche React permet de l’ouvrir | Donner aux lieux des URI stables. Générer le JSON-LD de proximité et valider séparément le profil et la fiche |
| Export global | `GET /api/export/base-de-donnees.xml` génère déjà un XML validé avec clés et références XSD. Les factures incluses sont des résumés relationnels | **Tout compte connecté y a accès aujourd’hui.** Protéger la route avant toute diffusion. Couvrir les données nouvelles et la demande de collection de factures complètes |
| Peuplement | Générateur reproductible d’utilisateurs, logements et associations d’équipements | Ajouter un scénario de séjours/factures en volume, des annonces de démonstration localisées et un extrait territorial sourcé |
| Navigation secondaire | Favoris et messages renvoient à une page « prochainement ». `favori` et `disponibilite` existent en SQL | Rendre les favoris fonctionnels pour retrouver un refuge. Retirer l’entrée Messages de la version présentée. Le profil et la réservation assurent déjà la mise en relation |

**Mesure de départ.** Sur la copie SQLite locale, en lecture seule, j’ai compté **23 utilisateurs, 103 logements, 10 équipements, 310 associations logement–équipement, 3 réservations et 1 facture**. Les tables de favoris et de disponibilités étaient vides. Les trois exemples du vérificateur JSON donnent les résultats attendus. Le XML global passe son XSD. Une requête XPath retrouve 32 logements dotés de volets. La facture locale passe sa DTD et son XSD et produit du HTML et du texte. Ces nombres décrivent cette copie de travail et varieront après peuplement. Ils montrent où investir le travail supplémentaire.

**Repères dans le dépôt.** Le point d’entrée est [l’API actuelle](../src/api/app.py). Lire en priorité [les migrations](../src/db/migrations), [le DBML de départ](schemas/schema-bdd-v1.dbml), [la route d’export](../src/api/routes/export.py), [le service de documents logement](../src/api/services/logement_documents.py), [les formats](../src/formats), [la navigation](../src/web/src/data/navigation.js) et [la carte actuelle](../src/web/src/pages/MapPage.jsx). La [revue précédente](revue-projet.md) et la [fiche de réalisation climatique](fiche-realisation-dimension-climatique.md) donnent le contexte. Le prototype `src/server` et `src/client` reste une référence historique. Toute réalisation de cette feuille concerne `src/api`, `src/db`, `src/formats` et `src/web`.

## 3. Ce que fera chaque acteur

| Acteur | Parcours complet à livrer | Limite de visibilité |
|---|---|---|
| Visiteur | Ouvre l’accueil, lit la météo de La Clusaz, filtre les logements avec volets ou extérieur ombragé, inspecte la carte/liste des services, consulte une fiche et le profil public | Données de logements publiés, attributs publics des lieux, coordonnées du profil déjà prévues par l’application |
| Voyageur connecté | Enregistre deux favoris, choisit un logement, demande des nuits disponibles, retrouve la décision et la facture dans « Mes séjours » | Ses favoris, ses demandes, ses factures |
| Hébergeur | Saisit son annonce ou utilise le texte libre, confirme l’adresse, renseigne les protections contre la chaleur, ouvre ses dates et gère ses demandes | Ses annonces et les séjours reçus. Les droits d’hébergement viennent de la propriété du logement |
| Agent habilité de la mairie | Consulte la couverture par catégorie, la source et la fraîcheur des imports. Complète un lieu de fraîcheur local documenté, peut retirer de la diffusion une annonce problématique avec un motif et télécharge l’export global destiné au suivi | Habilitation contrôlée par Flask à chaque opération municipale. Les routes privées ordinaires de séjour gardent leurs propres contrôles |

**Décision d’interface.** L’accueil reste court. Une ligne donne la météo datée, les dernières annonces restent sur leur carrousel et un lien ouvre « Eau, santé et lieux frais » sur la carte. La fiche logement porte les détails. Une même liste de lieux alimente la carte, les fiches et les documents. Sur mobile et au clavier, chaque service reste consultable dans une liste, même quand le fond de carte est indisponible.

## 4. Quelles données apporter, d’où et pourquoi

| Jeu | Champs à retenir | Acquisition et fréquence proposées | Présentation honnête |
|---|---|---|---|
| Adresse et position du logement | Identifiant source si fourni, adresse normalisée, type/précision, code commune, longitude, latitude, date de vérification | Géocodage IGN alimenté par la BAN. Recherche avec `q`, `index=address`, `citycode=74080`, maximum cinq suggestions. Contrôle serveur du résultat retenu à la création ou au changement d’adresse | Accepter un résultat à l’adresse numérotée confirmé. Une rue, un résultat hors commune ou un service indisponible laisse la position à confirmer. [Géocodage IGN](https://cartes.gouv.fr/aide/fr/guides-utilisateur/utiliser-les-services-de-la-geoplateforme/geocodage/) |
| Altitude | Altitude du terrain en mètres, ressource, date | API IGN, ressource `ign_rge_alti_wld`, à la confirmation ou au déplacement du point | Afficher « altitude du terrain ». Une valeur manquante reste inconnue. [Calcul altimétrique IGN](https://cartes.gouv.fr/aide/fr/guides-utilisateur/utiliser-les-services-de-la-geoplateforme/calcul-altimetrique/) |
| Confort déclaré | Ombre extérieure en été (inconnue, aucune, partielle, importante), volets, ventilateur, climatisation, possibilité d’aération traversante si connue | Un choix d’ombrage et le catalogue d’équipements existant, complété au besoin. Saisie/modification par l’hôte | Libellé « déclaré par l’hébergeur ». Jardin et altitude seuls ne suffisent pas pour promettre une chambre fraîche |
| Eau, santé, déplacements | Points d’eau potable, pharmacies, arrêts de bus/navettes, commerces alimentaires si recensés | Extraire les objets OSM via Overpass dans une emprise bornée autour de la commune. Import hebdomadaire proposé, lecture locale depuis SQLite | Nom ou libellé de catégorie, accès si connu, distance, lien source et date. Un arrêt indique un emplacement. Le lien vers l’opérateur donne les horaires. [Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API) |
| Espaces et loisirs | Lacs, piscines accessibles au public, lieux frais et espaces ombragés documentés | Même catalogue + entrées municipales sourcées pour les lacunes. Confronter les objets à des pages locales | Qualifier séparément baignade, accès, ouverture saisonnière et ombre. Une piscine privée est exclue des équipements publics. Un lac peut être affiché comme lieu naturel. [Espace aquatique](https://www.laclusaz.com/details/espace-aquatique-la-clusaz/), [services de santé de La Clusaz](https://www.laclusaz.com/la-station/commerces-et-services/sante/) |
| Météo communale | Température extérieure actuelle issue du modèle, minimum/maximum quotidiens, unité, fuseau, date de validité et de récupération | Open-Meteo Forecast sur un point communal identifié. Demander `current=temperature_2m`, `daily=temperature_2m_min,temperature_2m_max`, `past_days=2`, `forecast_days=7`, `timezone=Europe/Paris`. Cache partagé 1 h | Distinguer jours écoulés, valeur actuelle et prévisions. Indiquer « minimum quotidien » si c’est la variable reçue. Aucune extrapolation aux dates lointaines, ni à l’intérieur d’un logement. [API météo](https://open-meteo.com/en/docs), [conditions pour usage universitaire non commercial](https://open-meteo.com/en/terms) |

**Adaptation et réduction de l’impact.** L’ombrage, les volets, l’aération possible, l’accès à l’eau et les minima prévus aident à choisir un refuge en période chaude. Pour agir aussi sur l’impact du séjour, la fiche met en avant les protections passives déclarées et l’accès en transport collectif. Une courte aide à la publication explique pourquoi demander ces informations. Les données disponibles permettent de montrer des alternatives concrètes. Un bilan carbone ou une note de « fraîcheur garantie » nécessiterait d’autres mesures. [Conseils de l’ADEME pour garder un logement frais](https://agirpourlatransition.ademe.fr/particuliers/proteger-sante/periode-canicule/canicule-comment-garder-logement-frais)

**Premier inventaire territorial à réaliser.** Chercher d’abord la pharmacie du Danay dans l’annuaire local, l’espace aquatique dans sa fiche officielle et le lac des Confins sur la carte. Comparer nom, catégorie, coordonnées et conditions d’accès, puis chercher des points d’eau et arrêts autour de deux adresses distinctes. Conserver une trace des divergences. Ces exemples servent à contrôler l’import. Le nombre de points effectivement présents reste à mesurer. [Annuaire santé](https://www.laclusaz.com/la-station/commerces-et-services/sante/), [repérage du lac des Confins par l’office de tourisme](https://www.laclusaz.com/app/uploads/2025/05/Randonnees-accessibles-au-6-mai-2025.pdf)

**Provenance et redistribution.** Conserver l’identifiant OSM avec son type (`node/…`, `way/…`, `relation/…`), l’URL, la date de collecte et, si disponible, la date de révision de l’objet. Attribuer les contributeurs sur la carte et dans l’extrait distribué. Documenter la licence de l’extrait OSM, l’attribution météo et la ressource IGN utilisée. Les pages locales servent à vérifier un fait et à renvoyer vers l’exploitant. Pour le jeu livré, conserver des faits sourcés et des données réutilisables, avec les mentions de chaque source. [Licence OSM](https://www.openstreetmap.org/copyright), [usage des tuiles OSM](https://operations.osmfoundation.org/policies/tiles/)

## 5. Modèle minimal et circulation des données

| Évolution SQLite proposée | Relation et règles |
|---|---|
| Habilitation `utilisateur.est_admin` | Booléen contrôlé, faux par défaut, indépendant de `role`. Le mécanisme actuel de promotion en propriétaire continue de fonctionner. Attribution à un compte existant par commande locale explicite |
| Colonnes climatiques de `logement` | Ombre déclarée et position confirmée du **logement** avec identifiant source, précision, dates et altitude nullable. Latitude et longitude présentes ensemble et bornées. Les adresses personnelles des utilisateurs ont un autre usage |
| Suspension municipale du logement | Date et motif nullable sur le logement. La publication effective exige un statut publié par l’hôte et aucune suspension. Lever la suspension restitue le choix de publication de l’hôte |
| `point_interet` partagé | ID interne stable, source + ID externe unique, catégorie, nom facultatif, point géographique, nature du point (entrée, position cartographiée, centre représentatif), état d’accès, URL de preuve, dates et statut actif. Index catégorie/actif. Les lieux municipaux portent leur propre source |
| Dernier import territorial | Petit enregistrement de suivi par source avec dernière tentative, dernier succès, volume et résultat. Utile pour expliquer une couverture partielle et décider d’une nouvelle tentative |
| Cache météo de la commune | Une entrée avec point, fuseau, date de récupération, plage de validité et réponse normalisée. Décoder et contrôler la réponse avant de remplacer la dernière entrée valide |
| Relations existantes | Réutiliser `logement_equipement`, `favori` et `disponibilite`. Les distances logement–lieu sont calculées à la lecture pour le territoire du TP. Les réservations et leurs factures conservent leur historique figé |

Ajouter des migrations numérotées **après 004**, par changement cohérent. Mettre à jour le DBML pour refléter la base effective, y compris la facturation de 004. Vérifier la montée de version sur une copie peuplée et l’installation sur une base vide. Une annonce ancienne reste consultable et réservable avec des champs climatiques inconnus. Un changement d’adresse invalide dans la même écriture coordonnées, altitude et géocodage précédents.

**Trois circuits à expliquer au tableau**

1. **Déclaré.** Texte libre → ILaaS → JSON partiel → relecture de l’hôte → JSON complet validé → SQLite. Les équipements physiques et l’ombre restent sous la responsabilité de l’hôte.
2. **Enrichi.** Adresse sélectionnée → validation géographique → coordonnées → altitude + recherche dans le catalogue local → document du logement enrichi. Météo commune datée lue depuis son cache. La même donnée se retrouve dans React, le document HTML et les représentations pour programmes.
3. **Transactionnel.** Demande → acceptation par l’hôte → facture figée en transaction → XML validé → XSLT → HTML/texte. La météo et les services évoluent indépendamment du montant facturé.

### Contrats d’API à raccorder

Les noms suivants sont proposés pour guider le développement. Une extension compatible d’une route existante suffit quand elle porte déjà la bonne ressource.

| Entrée | Sortie et consommateur | Condition |
|---|---|---|
| `GET /api/territoire/adresses?q=…` | Suggestions normalisées pour le formulaire ; identifiant source, libellé, numéro, commune et précision | Limiter la saisie et le volume. Revalider l’adresse retenue côté serveur lors du POST ou PUT |
| `GET /api/logements/{id}/environnement` | Localisation, altitude, ombre, équipements pertinents et proximité. Tableau de lieux vide avec état explicatif si localisation inconnue | Logement effectivement publié. Même service Python pour le document HTML, sans appel HTTP interne |
| `GET /api/territoire/carte.geojson` | Collection de points pour la carte et sa liste ; identifiant, famille, catégorie, libellé et lien de destination | Services même sans annonce ; logements visibles uniquement |
| `GET /api/territoire/meteo` | Valeur actuelle, série par date, fuseau, unités, provenance et état du cache | Une réponse communale pour tous les visiteurs. Aucune donnée personnelle dans la requête |
| `GET /api/admin/territoire` et écriture des lieux municipaux | Bilan des imports, volumes par catégorie et édition d’un lieu sourcé | Habilitation mairie relue en base. Attribuer au serveur l’identité de l’auteur d’une correction |
| `GET /api/export/base-de-donnees.xml` (existante) et `GET /api/export/factures.xml` (proposée) | Exports administratifs validés. Les routes de factures unitaires continuent d’alimenter la fenêtre d’un séjour | Mairie pour les collections, parties concernées pour la fenêtre du séjour |

## 6. Ordre de réalisation et critères de réception

Chaque lot se termine par un parcours visible et une preuve reproductible. Les mentions **proposée** identifient les contrats définis au départ. Pour reprendre un lot, vérifier d’abord sa réalisation dans le tableau de reprise et dans les routes présentes. Reprendre les conventions de routes, services et repositories du dépôt.

### Lot 1 — Réserver l’export à la mairie

- [x] Ajouter l’habilitation, une commande locale qui l’accorde ou la retire à un compte identifié, et le contrôle côté Flask sur la route d’export existante. Refuser ce champ dans le JSON public d’inscription et dans les actions ordinaires du compte.
- [x] Afficher « Administration » aux seuls comptes habilités, dans le menu et depuis « Mon compte » sur mobile. Y déplacer « Export BDD ». Commencer avec l’export déjà fonctionnel, puis ajouter le suivi territorial au lot 3.
- [x] Donner à la mairie une action limitée « Suspendre la diffusion » / « Lever la suspension » avec motif visible dans « Mes logements ». Appliquer la règle de publication aux lectures publiques (liste, photos, fiche, profil comptant les annonces, puis carte) ainsi qu’aux nouvelles demandes et acceptations. Une republication par l’hôte ne contourne pas la suspension. Conserver l’accès privé aux séjours déjà acceptés et à leurs factures.
- [x] Conserver les vérifications hôte/voyageur sur chaque annonce, réservation et facture. Les comptes municipaux qui voyagent ou hébergent suivent les mêmes parcours.
- **Réception.** Appel direct à l’export avec quatre sessions. Visiteur → 401, voyageur → 403, hébergeur ordinaire → 403, mairie → XML valide. Retirer l’habilitation et réessayer dans la session déjà ouverte. Vérifier le nouveau contrôle avant de générer le XML. Suspendre une annonce, tenter de la republier comme hôte, lever la suspension et contrôler ses accès publics et ses séjours historiques.

### Lot 2 — Localiser deux logements et décrire leur protection contre la chaleur

- [x] Ajouter les champs et la migration. Dans le formulaire partagé de création/modification, conserver une saisie manuelle et proposer les adresses IGN après trois caractères, avec temporisation et annulation des résultats périmés. Afficher la rue, le numéro et la commune avant sélection.
- [x] Flask vérifie la suggestion, le code INSEE **74080**, le type et la concordance avec l’adresse enregistrée. Le code postal **74220** seul ne suffit pas. Un changement de texte après sélection annule cette sélection. Une panne laisse publier l’annonce avec localisation à confirmer. Une adresse reconnue dans une autre commune doit être corrigée.
- [x] Récupérer l’altitude pour une position validée. L’appel réseau se fait hors transaction d’écriture. Lors d’une réponse tardive, vérifier que la position n’a pas changé avant d’enregistrer l’altitude.
- [x] Permettre de renseigner l’ombre et les équipements dès la publication puis en modification. Afficher immédiatement « Protection contre la chaleur » dans la fiche. Mutualiser les définitions dans les JSON Schema de création, de sortie et de préremplissage lorsque le champ est autorisé. Mettre à jour les exemples valides et invalides.
- **Réception.** Créer deux annonces de démo à des adresses vérifiées distinctes, une avec protections déclarées, l’autre avec ombre inconnue. Modifier l’adresse de la première. Une rue imprécise, une ancienne annonce et un échec IGN ne doivent produire aucun repère fictif. Une altitude absente doit préserver les autres données.

### Lot 3 — Donner un territoire à explorer à la mairie et aux voyageurs

- [x] Écrire une commande proposée `make import-poi` qui extrait les nœuds, chemins et relations dans une emprise de La Clusaz avec une marge d’au moins 2 km. La marge permet de voir le service le plus proche d’un logement limitrophe. Archiver l’emprise, les filtres et la date de l’extrait de démo.
- [x] Première sélection OSM à vérifier sur échantillon : `amenity=pharmacy`, `amenity=drinking_water`, `highway=bus_stop` ou plate-forme de bus, `natural=water` avec qualification lac, bassins et centres de natation qualifiés, commerces alimentaires. Accepter les tags d’eau potable explicites, dédupliquer les représentations d’un même arrêt ou établissement avec examen des cas ambigus. Identifier les services frais accessibles uniquement sur preuve datée.
- [x] Normaliser les coordonnées, catégories et sources avant transaction. Utiliser la clé externe pour réimporter. Si le fournisseur échoue, tronque sa réponse ou renvoie un volume anormalement vide, conserver le dernier lot valide et signaler l’incident. Désactiver les objets disparus seulement après un import complet. Préserver les compléments municipaux d’un import au suivant.
- [x] Dans « Administration », afficher le dernier succès, la couverture **par catégorie** et les lieux dont l’accès reste inconnu. Prévoir un formulaire limité pour ajouter, corriger ou retirer un lieu municipal avec source et date. L’import OSM peut rester une commande de maintenance. Éviter un CRUD national ou une administration des comptes.
- [x] Pour une annonce localisée, calculer les distances à vol d’oiseau en mètres (Haversine). Valeur initiale proposée : rayon de 2 km et trois résultats par catégorie, tri stable par distance puis identifiant. Un lac possède parfois un point représentatif loin de sa rive. Privilégier un accès cartographié ou préciser ce que représente le point. Sur la carte communale, un lieu reste visible même s’il est éloigné du logement.
- **Réception.** Importer deux fois le même extrait et comparer les identifiants et volumes. Couper le réseau et relire les résultats. Créer un complément municipal, relancer l’import et vérifier sa persistance. Pour deux logements, expliquer pourquoi les listes ou distances diffèrent. Une catégorie vide doit distinguer l’absence de résultat recensé d’une panne.

### Lot 4 — Livrer le JSON-LD des alentours et la carte vivante

- [x] Servir un document de contexte depuis Flask (proposition `GET /api/logements/{id}/environnement`) avec position connue, protections, lieux retenus, distances et provenance. Définir son JSON Schema et réutiliser ce document pour la fiche enrichie. Le catalogue de cartes reçoit seulement les propriétés utiles aux marqueurs.
- [x] Remplacer l’iframe de `MapPage` par Leaflet. Un endpoint GeoJSON proposé `GET /api/territoire/carte.geojson` retourne les logements publiés localisés et les services actifs. `Feature.id` reste stable, `geometry.coordinates` suit l’ordre **longitude, latitude**. Séparer visuellement logements, eau, santé, loisirs et transport, avec légende et liste accessible. [Format GeoJSON](https://www.rfc-editor.org/rfc/rfc7946)
- [x] Depuis la fiche, ouvrir `/carte?logement={id}` sur le bon logement. Depuis un marqueur, ouvrir la fiche ou la source du lieu. Le filtre de catégorie et la sélection doivent aussi fonctionner sans souris. Une annonce désactivée disparaît des données publiques et de ses documents.
- [x] Construire côté serveur le graphe décrit en section 7. L’insérer dans le HTML effectivement servi pour la fiche documentaire et le rendre disponible depuis la fiche React. Utiliser le même constructeur et les mêmes identifiants. Le HTML de la fiche doit être testable par copier-coller même en local et même sans exécution de JavaScript.
- **Réception.** Sur une fiche donnée, comparer automatiquement les identifiants et noms visibles avec ceux du graphe et du GeoJSON. Pour un profil et une fiche de démonstration, enregistrer ce qu’extrait le validateur. La pharmacie doit apparaître comme lieu distinct. Aucun service des alentours ne doit être présenté comme un équipement privé du logement.

### Lot 5 — Faire apparaître l’intérêt climatique avant la réservation

- [x] Ajouter le cache et l’adaptateur Open-Meteo. Contrôler unités, dates et correspondance des tableaux. Conserver un dernier succès horodaté. Proposition de repli : servir la dernière prévision encore pertinente pendant six heures au plus, signalée avec son heure, puis afficher l’indisponibilité. Garder consultation territoriale et réservation possibles.
- [x] Sur l’accueil, afficher le contexte communal et un accès direct à la carte des services. Dans la fiche, rapprocher météo, protections déclarées et services. Pour un séjour dans l’horizon reçu, sélectionner les jours couverts. Pour une date plus lointaine, indiquer quand les prévisions sont disponibles.
- [x] Dans le catalogue, proposer au minimum les filtres « Volets » et « Extérieur ombragé ». Réutiliser les mêmes critères pour les résultats et les états vides. Le détail permet d’identifier ventilateur, climatisation et proximité d’une navette. Donner accès aux sources et à la date en un geste.
- **Réception.** Un visiteur trouve un logement à volets, lit son altitude, identifie une pharmacie ou un point d’eau et comprend la période de prévision avant connexion. Démontrer aussi une annonce avec peu de renseignements et un séjour hors de l’horizon météo.

### Lot 6 — Terminer les parcours de séjour déjà amorcés

- [x] **Disponibilités.** Utiliser les lignes de `disponibilite` comme périodes ouvertes `[arrivée, départ[`. Zéro période conserve le comportement actuel « ouvert hors réservations acceptées ». Proposer l’édition dans « Mes logements », expliquer la suppression de la dernière plage, fusionner les plages contiguës et refuser les intervalles invalides. Contrôler la couverture entière au dépôt **et** à l’acceptation. Empêcher une modification d’invalider un séjour déjà accepté. Informer l’hôte des demandes pendantes affectées. Réutiliser les contrôles transactionnels de chevauchement existants.
- [x] **Favoris.** Réutiliser la table existante, ajouter/retrait idempotents pour l’utilisateur de la session, liste privée simple, lien vers la fiche. Une annonce désactivée n’est plus consultable depuis cette liste. Le bouton favori ne doit pas provoquer de réservation ni changer le prix.
- [x] **Navigation.** Remplacer l’entrée « Favoris » provisoire, retirer « Messages » des menus jusqu’à une éventuelle version ultérieure. Vérifier les liens après connexion/déconnexion, le menu de compte sur petit écran, le retour de l’aperçu facture et la navigation clavier.
- [x] **Chaîne déjà livrée.** Vérifier demande → refus ou acceptation → facture accessible aux deux parties → annulation, droits d’un tiers, concurrence pour les mêmes nuits, séjour gratuit et centimes. Préserver la commission de 5 % incluse côté propriétaire.
- **Réception.** Un propriétaire ouvre une semaine précise, un voyageur la retrouve dans ses favoris et demande la période. Une demande qui déborde est refusée. Deux acceptations incompatibles ne passent pas. Une facture unique reste lisible depuis les deux espaces après annulation. Les anciennes annonces restent réservables selon la règle historique.

### Lot 7 — Achever les représentations documentaires et l’export

- [x] **Logement.** Partir du JSON public validé, lui associer son contexte de proximité validé, construire un petit arbre XML explicite avec lxml. Appliquer deux sorties XSLT locales, HTML autonome avec CSS d’impression et texte imprimable distinct. Conserver les URL actuelles `fiche.html` et `fiche.txt`. Garder les libellés, prix, valeurs absentes et liens cohérents. Sérialiser le JSON-LD avec un encodeur JSON sûr pour l’inclusion en HTML, indépendant de la mise en page XSLT.
- [x] **Facture.** Garder le chemin éprouvé et intégrer à la vérification de la V1 un exemple accepté par DTD et XSD. Ajouter un contre-exemple de structure et un autre avec une date ou une quantité invalide. Faire constater ce que le XSD contrôle en plus de la DTD.
- [x] **Base entière.** Étendre l’export relationnel et son XSD pour les lieux actifs/inactifs, les champs climatiques utiles et les provenances. Documenter les limites de l’export métier (secrets, données d’authentification et caches techniques exclus). Employer une lecture SQLite cohérente pour l’ensemble des tables. Conserver les références existantes et les XPath publiés.
- [x] **Toutes les factures selon le format unitaire.** La précision du sujet demande les factures structurées comme le XSD de la facture. L’export relationnel actuel contient les lignes et les montants mais ne reprend pas les parties figées sous chaque facture. Ajouter au même espace mairie une sortie de collection `factures.xml` qui enveloppe les documents complets produits par le constructeur existant. Son petit XSD de collection réutilise la déclaration de `facture.xsd`. Ne réécrire ni les montants ni le service d’émission. Vérifier montant, client et émetteur historiques après modification de l’annonce.
- **Réception.** Pour un même ID, la fiche HTML et le texte donnent le même loyer et les mêmes services que le document d’entrée. La facture du séjour est identique à celle de la collection une fois l’enveloppe retirée. Les deux exports passent leur XSD. Modifier une référence dans une copie de démonstration doit faire échouer le contrôle correspondant.

### Lot 8 — Peupler, vérifier, préparer le rendu

- [x] Ajouter un scénario de démonstration sur une **base dédiée**, avec des identités fictives, un client, deux hôtes, un compte mairie et une graine publiée. Conserver `make populate` pour son usage actuel. Prévoir une commande supplémentaire reproductible qui affiche les compteurs obtenus et le chemin de la base visée.
- [x] Objectif proposé sur cette base : environ 100 logements, 20 utilisateurs et au moins 100 factures via les services de réservation/acceptation. Répartir les dates sans conflits, produire aussi des refus et annulations. Tester le mode volumineux sans multiplier les appels IGN ou ILaaS. Préparer 3 à 5 annonces fictives géolocalisées à des adresses publiques vérifiées pour la démo, et un cas volontairement inconnu. Séparer clairement les annonces fictives des lieux publics réels.
- [x] Distribuer un petit extrait daté du territoire réimportable localement avec sa source, sa licence et la date de collecte. Produire un bilan par catégorie : total, actifs, accès public confirmé, inconnus, dates des dernières vérifications. Aucun seuil arbitraire de lacs ou de pharmacies. Utiliser les vrais nombres, y compris les zéros. Préparer une réponse météo datée utilisable hors ligne, identifiée comme exemple archivé.
- [x] Élargir `make verifier-documents` à la V1 finale. Lancer la construction React, vérifier les parcours et les documents sur la base de démo. Tester ILaaS réel si la clé est disponible, puis le cas indisponible. Conserver le résultat observé et la date, en distinguant tests sur échantillon, hors ligne et fournisseur réel.
- [x] Mettre à jour la revue, le DBML et le README avec les commandes exactes après réalisation. Fournir un jeu réduit d’artefacts anonymes, les sorties des vérifications et les captures des validateurs. Un seul jeu de démonstration doit permettre de reproduire la présentation.
- **Réception.** Depuis une base dédiée vide, un autre membre du groupe peut lancer la démo, retrouver les documents et expliquer chaque transformation en suivant le README. Refaire la démonstration hors ligne avec l’extrait local, sans présenter une météo archivée comme actuelle.

## 7. Le JSON-LD demandé par le professeur, concrètement

**Question à laquelle le document répond.** « Sur la fiche de ce logement, quels lieux sont présentés comme proches, dans quel ordre, et comment retrouver le même lieu sur une autre fiche ? » Le RDFa du profil identifie déjà une personne. Ici, la nouvelle donnée est la relation entre **un logement précis** et **une liste de lieux du territoire sélectionnée à partir de sa position**.

Construire une fois la liste triée avec les champs `lieuId`, `categorie`, `nom`, `distanceMetres`, `typeDePoint`, `acces`, `sourceUrl` et `verifieLe` si la vérification est connue. HTML et JSON-LD prennent leurs valeurs dans cette liste. Donner à chaque logement et lieu une URI absolue stable construite sur l’origine publique configurée. Un point d’intérêt réutilisé dans dix fiches garde la même URI. Le rang et la distance dépendent du logement et appartiennent à l’entrée de liste. Utiliser `sameAs` uniquement pour une identité externe confirmée. Un annuaire général peut être un lien de source sans devenir une identité équivalente.

**Exemple de forme**, avec un logement fictif, un arrêt fictif et une distance illustrative. L’origine `.example` est remplacée par celle de l’application lors du rendu. Le lien de carte doit pouvoir sélectionner le lieu même après rechargement.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": "https://refuge.example/api/logements/12/fiche.html",
      "@type": "WebPage",
      "mainEntity": { "@id": "https://refuge.example/logements/12#logement" },
      "mentions": { "@id": "https://refuge.example/api/logements/12/fiche.html#alentours" }
    },
    {
      "@id": "https://refuge.example/logements/12#logement",
      "@type": "Accommodation",
      "name": "Logement de démonstration"
    },
    {
      "@id": "https://refuge.example/api/logements/12/fiche.html#alentours",
      "@type": "ItemList",
      "name": "Lieux proches du logement, par distance à vol d’oiseau",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "description": "À 420 m à vol d’oiseau du logement",
        "item": { "@id": "https://refuge.example/carte?lieu=23#lieu" }
      }]
    },
    {
      "@id": "https://refuge.example/carte?lieu=23#lieu",
      "@type": "BusStop",
      "name": "Arrêt de démonstration"
    }
  ]
}
```

Dans le vrai graphe, renseigner `geo` et `GeoCoordinates` pour les points vérifiés, utiliser `Pharmacy`, `LakeBodyOfWater` ou `Place` suivant la qualification disponible. La distance numérique exacte reste exploitable dans le JSON métier. L’ordre du `ItemList` doit correspondre à la liste visible (tri global après sélection des trois lieux par catégorie). Le HTML embarque le graphe dans `<script type="application/ld+json">`. Employer un sérialiseur qui échappe notamment `<` dans ce contexte. Une annonce dont le titre contient des guillemets, une esperluette ou la séquence de fermeture d’un script doit rester un document lisible et sûr. [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/), [Accommodation](https://schema.org/Accommodation), [mentions](https://schema.org/mentions), [ItemList](https://schema.org/ItemList), [geo](https://schema.org/geo)

**Preuve sémantique à rendre**

1. Ouvrir « Proposé par », copier le HTML final du profil fictif et constater l’extraction de `Person → givenName, familyName`.
2. Ouvrir les documents du logement, lire « À proximité » et relever un nom, une distance et une source.
3. Copier le HTML complet de cette fiche dans le validateur de balisage. Retrouver `WebPage → mainEntity → Accommodation` et `mentions → ItemList → ListItem → item`. Cliquer le lieu depuis la fiche ou la carte et retrouver sa source. [Validateur Schema.org](https://validator.schema.org/)
4. Refaire l’essai avec un deuxième logement. Si le même lieu est proche des deux, son URI doit être identique et sa distance recalculée. Contrôler aussi le cas sans coordonnées et le cas de coordonnées présentes sans lieu dans le rayon.
5. Conserver deux petits extraits anonymes et les résultats d’extraction dans la revue. L’extraction du graphe, la conformité du vocabulaire et l’exactitude des distances sont trois vérifications différentes.

## 8. Où démontrer chaque notion du cours

Les numéros ci-dessous désignent des pages **du PDF**, qui contiennent parfois plusieurs diapositives. Le professeur doit pouvoir demander « montrez-moi un exemple » et le voir dans le parcours déjà ouvert.

| Support et notion | Où la mettre en œuvre | Manipulation à montrer |
|---|---|---|
| [Introduction](cours/Introduction.pdf), pp. 1–3. Collecte, transformation, présentation, qualité | Provenance, date et nature de chaque information sur la fiche | Prendre « pharmacie à proximité », remonter à son identifiant source, puis expliquer le calcul local de la distance |
| [Convergence documents–données, hypermédia](<cours/Convergence Documents Données, Hypermedia.pdf>), pp. 2–6. Document, nœud, ancre, destination, graphe | Logement → hôte, logement → lieu sur la carte → source, séjour → facture, document → schéma via `describedby` | Suivre un lien dans l’interface. Montrer la clé étrangère en SQLite, puis l’URI qui permet de naviguer sur le Web |
| [JSON et JSON Schema](<cours/Présenter JSon.pdf>), pp. 1–3. Objets, listes, types, contraintes, définitions réutilisées | Formulaire complet, réponse partielle du LLM, document public du logement, catalogue des lieux | Valider un document puis changer une latitude ou un type. Montrer le chemin du champ en erreur et les définitions communes utilisées par `$ref` |
| [XML et DTD](<cours/Présenter XML et DTD.pdf>), pp. 2–6. Élément, attribut, ordre, occurrence, document valide | Facture unitaire, racine, attributs et lignes | Retirer un élément obligatoire dans une copie. Lire l’erreur DTD. Comparer à un XML mal formé que le parseur refuse avant validation |
| [XSD](<cours/Présenter XSD.pdf>), pp. 1–4. Types, restrictions, cardinalités et réutilisation | Dates et montants de la facture. XSD de collection. Clés et références dans la base exportée | Introduire une date impossible ou une référence orpheline dans une copie. Montrer quelle règle XSD est violée |
| [XPath](<cours/Présenter Xpath 1-12.pdf>), pp. 1–2. Chemins, attributs, prédicats | Base exportée par la mairie et collection de factures | Identifier les logements avec volets puis, dans la collection, les numéros des factures d’un client. Exécuter en ligne sur le jeu fictif et localement |
| [XSLT](<cours/Présenter XSLT 1-18.pdf>), pp. 1–3. Templates, sélection XPath, transformations | Facture XML vers HTML/texte. Document de logement JSON validé, projeté en XML pour deux sorties | Montrer une sélection des lignes de facture ou des lieux proches et comparer son résultat à l’écran et sur le document imprimable |
| [RDFa](<cours/Présenter RDFa.pdf>), p. 1. Vocabulaire, types et propriétés | Profil public servi par Flask | Dans la même balise, lire le prénom affiché et `property="givenName"`. Vérifier à quel individu il appartient |
| [JSON-LD](<cours/Présenter RDFa.pdf>), p. 2 + demande orale. Identité et liens entre objets | Fiche documentaire du logement et lieux proches | Montrer la même pharmacie sur deux fiches et retrouver son `@id` dans les graphes |
| Prolongement utile au projet : GeoJSON | Liste géographique des services et des logements | Sélectionner un point sur la carte et retrouver son `Feature.id` et ses coordonnées dans la collection GeoJSON |

**Requêtes XPath de démonstration.** Les trois premières visent la structure actuelle de `baseDeDonnees`. La quatrième vise le fichier de factures complètes. Employer un nom présent dans le jeu livré. La dernière sélectionne les lieux actifs de la section territoriale.

| Question | Expression XPath 1.0 | Vérification |
|---|---|---|
| Combien de logements dans l’export ? | `count(/baseDeDonnees/logements/logement)` | Égalité avec le compteur SQLite du même export |
| Quels logements déclarent des volets ? | `/baseDeDonnees/logements/logement[equipementsLogement/equipementRef/@ref = /baseDeDonnees/equipements/equipement[.='Volets']/@id]/titre/text()` | La référence d’équipement est retrouvée par son nom |
| Quel montant a été émis, hors factures annulées ? | `sum(/baseDeDonnees/factures/facture[@statut='emise']/totalCentimes)` | Résultat en centimes comparé à la somme SQL |
| Quelles factures concernent un client nommé Dupont ? | `/factures/facture[client/nom='Dupont']/@numero` | Les numéros correspondent aux factures figées du jeu fictif |
| Quelles pharmacies actives figurent dans le territoire ? | `/baseDeDonnees/lieux/lieu[@categorie='pharmacie' and @actif='true']/nom/text()` | Comparer à l’inventaire communal. Un lieu sans nom reste comptable avec `count(...)` |

Pour un évaluateur qui affiche seulement des nœuds, commencer par les chemins qui renvoient des éléments, puis utiliser un éditeur compatible pour `count()` et `sum()`. Garder l’export volumineux pour la preuve de peuplement et une petite base fictive de même schéma, avec résultats attendus, pour le copier-coller en ligne.

## 9. Comment décider que l’application est finie

| À rejouer pour la livraison | Résultat attendu |
|---|---|
| Migration depuis la branche actuelle et installation neuve | Comptes, logements et facture historiques toujours lisibles. Contrôles de clés étrangères SQLite satisfaits. Nouveaux champs inconnus gérés |
| CRUD annonce avec et sans IA | Modifier, masquer et republier conservent la cohérence des documents, photos et marqueurs. Le formulaire fonctionne lorsque le LLM est indisponible |
| Qualité des lieux | Latitude/longitude inversées, coordonnées hors emprise, doublons de source, piscine privée, source périmée et catégorie sans résultat ont chacun un comportement observable |
| Météo | Dates/unités cohérentes. Aucune prévision hors horizon annoncée. Panne et cache expiré identifiables. Le reste de l’écran reste utilisable |
| Habilitations | Route d’export réellement privée. Publication, modération des lieux, facture et réservations vérifiées aussi par appel direct. Une personne ordinaire ne peut ni modifier un lieu communal ni lire la facture d’un tiers |
| Réservation et comptabilité | Deux séjours adjacents possibles, chevauchement d’acceptations empêché, annulation conservée, commission du propriétaire visible, aucune double facture |
| Cohérence documentaire | Même logement dans JSON, carte, HTML, texte, JSON-LD. Même facture en JSON, XML, HTML, texte et collection. Un document volontairement invalide est refusé avec une erreur compréhensible |
| Preuves des rendus | DBML à jour, schémas et transformations lisibles, exports validés, exemple RDFa, exemple JSON-LD et XPath exécutés sur une base fictive. Sources et dates disponibles avec les exemples |
| Ergonomie de la démo | Parcours complet clavier, mobile et grand écran. Carte + alternative liste. Aucun lien visible ne mène à une page vide. La fenêtre de facture se ferme et rend le focus au bouton du séjour |

### Démonstration finale en huit minutes

| Temps | Action | Ce que le professeur constate |
|---|---|---|
| 0–1 min | Depuis l’accueil, chercher un hébergement avec volets, lire la tendance météo et ouvrir la carte des services | L’information sur le territoire intervient dès la recherche |
| 1–3 min | Comparer deux logements. Depuis la fiche, localiser une pharmacie ou un arrêt. Ouvrir sa source et montrer la distance calculée | Des faits distincts sont reliés par l’adresse. Expliquer lequel est déclaré, importé, calculé ou prévu |
| 3–4 min | Montrer le graphe JSON-LD extrait et le profil RDFa de l’hôte | Le professeur retrouve les mêmes entités à l’écran et avec un programme |
| 4–5 min | Côté hôte, saisir une description, observer le JSON partiel et compléter le formulaire | Le LLM assiste la saisie. Schéma et règles métier protègent la publication |
| 5–6 min | Depuis deux sessions déjà ouvertes, accepter un séjour et ouvrir l’aperçu facture | Séjour sélectionné, parties, commission et rendus XSLT proviennent des données figées |
| 6–7 min | Côté mairie, consulter la dernière collecte, télécharger le XML, exécuter un XPath de proximité ou d’équipement et un XPath de facturation | Le territoire est pilotable et la base peuplée est interrogeable comme document |
| 7–8 min | Modifier une valeur dans une copie et faire échouer une validation. Présenter un cas où une donnée climatique est inconnue | La démonstration couvre la structure, la signification, la qualité et les limites des données |

### Dépendances entre les lots

1. Commencer par le tableau de reprise. Sur une base dédiée, vérifier les droits du **lot 1** avant toute démonstration des exports.
2. Réaliser les **lots 2 à 4** sur deux annonces dès le début. C’est le premier jalon à présenter au groupe : ouvrir un logement, comprendre ses protections, retrouver ses lieux sur la carte et extraire le JSON-LD réel.
3. Ajouter le contexte météo et terminer les parcours déjà promis (**lots 5 et 6**). Vérifier immédiatement un séjour complet avec deux sessions.
4. Finaliser documents, volume et preuves (**lots 7 et 8**). Cocher chaque étape après sa vérification sur une base dédiée. Actualiser la revue avec les résultats réellement obtenus.
5. Pour tenir ce périmètre, reporter messagerie temps réel, paiement bancaire, application mobile native, itinéraires routés, surveillance nationale, alertes push et score climatique. Si le temps se resserre, protéger en premier la démonstration adresse → lieux → JSON-LD et les quatre rendus évalués.

**Critère de remise.** Un autre étudiant peut partir d’une adresse de démonstration, expliquer pourquoi l’annonce peut être utile par forte chaleur, vérifier les sources et les limites, relire ses documents structurés, effectuer le séjour et reproduire les validations. La mairie peut gérer les données territoriales et démontrer les requêtes sur un export autorisé.
