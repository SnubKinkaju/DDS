# Plan de présentation : Refuge climatique à La Clusaz

Le plan suit trois parties : rappel du sujet, présentation de l'application, partie technique. Une courte conclusion reprend les quatre rendus et les limites. La consigne du rendu 4 fixe le but de l'oral : « Répondre au besoin (relire l'énoncé), et montrer en même temps la mise en œuvre des formats et techniques vues en cours. » Chaque notion technique est donc montrée sur un fichier ou un écran du projet.

## Minutage proposé

Pour 15 minutes de présentation, à ajuster au temps accordé :

| Partie | Diapos | Durée |
|---|---|---|
| 1. Rappel du sujet | 1 à 4 | 2 min |
| 2. L'application, avec démo | 5 à 9 | 5 min |
| 3a. Concepts du cours | 10 à 18 | 5 min |
| 3b. Au-delà du cours | 19 à 22 | 2 min |
| Conclusion | 23 et 24 | 1 min |

La partie technique va vite si la démo a déjà ouvert les documents : une diapo, un fichier, une phrase. Un intervenant par partie, mais chacun doit pouvoir répondre sur toutes.

## Partie 1. Rappel du sujet

### Diapo 1. Titre

Refuge climatique : une plateforme municipale de logements temporaires à La Clusaz. Cours Documents et Données Structurées (Pierre Maret), M1 informatique parcours DSC, Université Jean Monnet. Noms des membres du groupe.

### Diapo 2. Le problème

- Pendant les canicules, des habitants des villes cherchent un endroit plus frais pour quelques nuits. Le sujet les appelle des réfugiés climatiques et prévoit que leur nombre va augmenter.
- Sans organisation locale, ce marché reviendra à des plateformes comme Airbnb, avec des règles que personne ne contrôle.
- Le sujet propose un système d'offre et de demande de logements temporaires sur un territoire, piloté par une collectivité. Les hébergeurs décrivent leur logement. La plateforme met en relation, prélève une commission et informe sur le lieu (météo, services disponibles).

### Diapo 3. Ce qui est attendu

Citer l'énoncé : « Le projet n'a pas pour objectif de réaliser un produit, mais d'appliquer les concepts du cours. »

| Rendu | Demande |
|---|---|
| 1 | Format JSON et JSON Schema pour le logement. Format XML, DTD et XSD pour la facture |
| 2 | Modèle de base de données. Texte libre vers JSON (avec un LLM) puis insertion en base. Liens entre les données. Facture XML générée depuis la base pour un séjour choisi |
| 3 | Base complétée et peuplée. Page HTML du propriétaire avec RDFa, testée. XML de toute la base et requêtes XPath en ligne |
| 4 | XSLT pour la facture (HTML et format imprimable), idem pour le logement. Revue de projet |

En séance, le professeur a ajouté des rubriques d'information locale (météo passée, actuelle et prévue, loisirs, commerces, santé, transports, logements), l'idée d'un outil vendable à une mairie et le JSON-LD des lieux autour d'un logement. Pistes pour aller plus loin : services des villes voisines, version anglaise.

### Diapo 4. Le territoire choisi : La Clusaz

- Commune de Haute-Savoie à environ 1 040 m d'altitude, dans les Aravis, reliée à Annecy par des lignes de bus.
- Environ 1 600 habitants pour plus de 5 000 logements, surtout des résidences secondaires (Insee). Ce parc peut accueillir des personnes pendant les épisodes de chaleur.
- Les logements sont à La Clusaz. Les demandeurs viennent d'Annecy, d'Annemasse, de Lyon ou d'ailleurs.
- À dire tout de suite : l'altitude ne garantit pas qu'un logement reste frais. L'application montre des faits sourcés (protections déclarées, altitude, températures prévues) et ne calcule aucune note de fraîcheur.

## Partie 2. L'application

### Diapo 5. Trois acteurs

| Acteur | Ce qu'il fait dans l'application | Compte de démo |
|---|---|---|
| Voyageur | Cherche et filtre les logements, consulte la météo et les services autour, garde des favoris, demande un séjour, lit sa facture | `voyageur@example.test` |
| Hébergeur | Publie au formulaire ou en texte libre avec l'IA, choisit une adresse officielle, déclare ses protections contre la chaleur, ouvre ses dates, accepte ou refuse les demandes | `hote@example.test` |
| Mairie | Suit la couverture du territoire, ajoute des lieux sourcés, suspend une annonce, exporte la base et les factures en XML | `mairie@example.test` |

Mot de passe commun des comptes fictifs : `RefugeDemo2026!`.

### Diapo 6. Démo voyageur (2 min)

- Accueil : température actuelle à La Clusaz et lien « Eau, santé et lieux frais sur la carte ».
- Catalogue : filtres « Volets » et « Extérieur ombragé ».
- Comparer la fiche n° 100 (village, pharmacie du Danay à 123 m à vol d'oiseau) et la fiche n° 99 (les Confins, lac à 490 m, aucune pharmacie dans un rayon de 2 km).
- Sur la fiche : protections déclarées par l'hôte, altitude IGN, lieux proches avec leur source, prévisions pour les dates choisies.
- Carte : logements et services, recherche « Danay ».
- Demander deux nuits.

Phrase à retenir : avant de réserver, le voyageur voit ce qui compte par forte chaleur, et d'où vient chaque information.

### Diapo 7. Démo hébergeur (1 min 30)

- « Publier un logement » : décrire un chalet avec volets pour quatre personnes, cliquer sur « Préremplir avec l'IA », relire le formulaire.
- Choisir l'adresse dans les suggestions. Seules les 2 544 adresses de la commune issues de la Base Adresse Nationale sont acceptées.
- Dans « Demandes reçues », accepter la demande du voyageur. La facture est créée dans la même transaction.

Phrase à retenir : l'IA propose, l'hébergeur valide, le schéma contrôle.

### Diapo 8. Démo mairie (1 min)

- « Administration municipale » : volumes de lieux par catégorie, date du dernier import.
- Ajouter un lieu municipal avec sa source. Suspendre une annonce avec un motif : elle disparaît du catalogue, des photos et de la carte.
- Télécharger la base en XML et la collection de factures. Ces fichiers servent ensuite pour XPath.

### Diapo 9. Ce que la plateforme apporte face à une plateforme privée

- La mairie modère les annonces et décrit elle-même les lieux utiles du territoire.
- Chaque fiche répond aux questions de quelqu'un qui fuit la chaleur : protections du logement, températures prévues, eau potable, pharmacie, arrêt de bus.
- Les données viennent de sources ouvertes et datées (OpenStreetMap, BAN, IGN, Open-Meteo), avec leur licence, et la mairie peut les exporter.
- La commission de 5 % est comprise dans le prix et prélevée sur la part de l'hébergeur. Sur 101,30 € payés, 5,07 € vont à la commission et 96,23 € à l'hôte. Le taux est réglable.

## Partie 3. Partie technique

### 3a. Les concepts du cours

### Diapo 10. Le fil rouge : trois circuits de données

```text
Déclaré         texte libre → ILaaS → JSON partiel → formulaire relu → JSON validé → SQLite
Enrichi         adresse BAN → coordonnées et altitude IGN → lieux OSM à moins de 2 km
                → document du logement → HTML, texte, JSON-LD, GeoJSON
Transactionnel  demande → acceptation → facture figée → JSON validé → XML validé (XSD)
                → XSLT → HTML et texte
```

Un même fait (un lieu, un montant) doit être identique dans tous les formats. `make verifier-documents` le contrôle sur la base de démo.

### Diapo 11. Convergence documents et données

Chapitre « Du document numérique aux données structurées ».

- Le cours présente les documents comme un moyen de visualiser les données d'une base, d'en capturer (« structurer via des formulaires, via des LLM ») et de les traiter. Le projet fait les trois : fiche et facture générées depuis SQLite, saisie par formulaire ou par LLM, exports pour la mairie.
- Le cours prévient que l'export d'une base perd de l'information et cite la vérification des clés étrangères. Notre export XML garde les relations avec `xs:key` et `xs:keyref`.
- Les documents sont générés à la demande : la fiche relit la base à chaque appel, donc un prix modifié apparaît aussitôt dans le JSON, le HTML et le texte.

### Diapo 12. JSON et JSON Schema (rendu 1)

- Un fichier de définitions communes, `logement-commun.schema.json` (`$defs`), réutilisé par `$ref` dans trois schémas : la saisie (`create-logement`), le document public (`logement`) et la proposition de l'IA (`logement-partiel`, sans champ obligatoire).
- Notions du cours présentes : `type`, `properties`, `required`, `enum`, `const`, `pattern`, `minimum` et `maximum`, `maxItems`, `uniqueItems`, `additionalProperties: false`.
- Prix en centimes entiers, pour éviter les arrondis.
- Montrer : `src/formats/examples/logement-invalide.json` (prix négatif) refusé, et l'en-tête HTTP `Link: rel="describedby"` qui renvoie au schéma.

### Diapo 13. XML, DTD et XSD : la facture (rendu 1)

- Racine `facture` avec attributs (numéro, date, statut, devise), puis émetteur, client, logement, séjour, lignes, commission et totaux en centimes.
- DTD : entités paramètres `%adresse;` et `%personne;`, cardinalités `?` et `+`, attributs énumérés `(emise | annulee)` et `#REQUIRED`.
- XSD : types simples par restriction (texte non vide, motif `FAC-AAAA-NNNNNN`, énumération), types complexes réutilisés (`personne`, `adresse`), `xs:date`, `xs:positiveInteger`, attributs `fixed`.
- Illustrer en direct la diapo « Limites des DTD » du cours : une date `date-invalide` passe la DTD et échoue au XSD. Retirer `client` fait échouer la DTD.

### Diapo 14. Base de données, peuplement et export XML (rendus 2 et 3)

- SQLite : 17 tables et une vue (`logement_public`), migrations numérotées de 001 à 007, schéma dans `docs/schemas/schema-bdd-v1.dbml`.
- Peuplement reproductible : `make dev-demo` crée 20 comptes, 100 annonces, 103 réservations, 101 factures et 164 lieux.
- `base_de_donnees.xml` est validé par un XSD avec `xs:key`, `xs:keyref` et `xs:unique`. Une annonce qui pointe vers un propriétaire inexistant est refusée.
- `factures.xml` regroupe les factures complètes. Son XSD inclut celui de la facture (`xs:include`).

### Diapo 15. XPath (rendu 3)

- Requêtes exécutées dans un testeur en ligne sur l'export de la base fictive : `/factures/facture[1]/emetteur/nom` et `/baseDeDonnees/lieux/lieu[@categorie="pharmacie"]/nom`. Captures dans `docs/preuves/`.
- Prédicats, attributs et fonctions du cours : `count()`, `sum()`, `starts-with()`, comparaisons numériques sur les centimes.
- Une remarque qui montre qu'on a pratiqué : XPath 1.0 ne compare pas les dates, d'où `starts-with(@dateEmission,'2026-11')`.
- Comme le dit le cours, XPath sert aussi ailleurs : sélecteurs des clés XSD et règles XSLT.

### Diapo 16. XSLT (rendu 4)

- Facture : `facture.xsl` (HTML imprimable en A4) et `facture-texte.xsl` (texte brut). Le formatage des dates et des euros est dans `facture-commun.xsl`, inclus par `xsl:include`.
- Instructions du cours : `xsl:template match`, `xsl:apply-templates`, `xsl:value-of`, `xsl:for-each` sur les lignes, `xsl:choose` pour une facture annulée. En plus : `xsl:call-template` avec paramètres et `format-number`.
- Logement : le sujet dit « idem » à partir du JSON. Flask valide le JSON, le projette en arbre XML avec lxml, puis applique `logement.xsl` et `logement-texte.xsl`. Le cours présente aussi la transformation de JSON par programme : préparer la justification de ce choix.
- Les transformations tournent côté serveur, avec lxml.

### Diapo 17. Liens et hypermédia

- Nœuds et liens du chapitre sur l'hypermédia : logement → hôte, logement → lieu → carte → source OSM, séjour → facture, document → schéma.
- Liens typés : `<link rel="alternate">` vers le JSON et le texte dans la fiche, en-tête `Link` avec `describedby` dans l'API.
- Hypermédia dynamique, où les liens sont calculés : la liste des lieux proches dépend de la position du logement.
- Hypermédia multi-serveurs : chaque lieu renvoie à sa fiche OpenStreetMap.

### Diapo 18. RDFa et JSON-LD (rendu 3 et demande orale)

- Profil de l'hôte en RDFa : `vocab="https://schema.org/"`, `typeof="Person"`, `givenName`, `familyName`. Testé avec le validateur Schema.org, capture `docs/preuves/profil-schema.png`. Si la question tombe : l'ancien outil de test de Google cité dans le cours a été remplacé par ce validateur.
- Fiche du logement avec un graphe JSON-LD : `WebPage` → `mainEntity` → `Accommodation`, et `mentions` → `ItemList` → `ListItem` → lieu typé (`Pharmacy`, `BusStop`, `LakeBodyOfWater`), avec ses coordonnées `geo`.
- Une pharmacie proche de deux logements garde le même `@id` sur les deux fiches. Seule la distance change.
- Capture `docs/preuves/fiche-schema.png`.

### 3b. Au-delà du cours

### Diapo 19. Un LLM pour structurer un texte libre

- API ILaaS au format chat/completions, modèle `mistral-small-4-119b`, température 0, clé conservée sur le serveur.
- Le prompt contient le schéma partiel, les définitions communes et le catalogue d'équipements. Il interdit d'inventer une caractéristique ou de déduire une ville.
- La réponse doit passer `logement-partiel.schema.json` et le contrôle des équipements. Elle remplit le formulaire et n'écrit rien en base.
- Pannes prévues : clé absente, délai dépassé, JSON invalide. Le formulaire manuel reste utilisable.
- Lien avec le cours : la diapo « Complémentarité Doc-SGBD » parle de structurer les données via des LLM.
- À faire avant l'oral : un vrai appel avec la clé du cours. La revue de projet indique que ce test reste à faire.

### Diapo 20. Carte et données géographiques

- Leaflet avec regroupement des repères, alimenté par un flux GeoJSON (`/api/territoire/carte.geojson`, coordonnées dans l'ordre longitude puis latitude).
- Sources ouvertes et datées : OpenStreetMap via Overpass (195 objets, 164 retenus), Base Adresse Nationale (2 544 adresses), géocodage et altitude IGN.
- Distance de Haversine, à vol d'oiseau, avec trois lieux par catégorie dans un rayon de 2 km.
- Licences et attributions dans `src/db/seeds/territoire/README.md` (ODbL, Licence Ouverte 2.0, CC BY 4.0).

### Diapo 21. Météo

- Open-Meteo : température actuelle, minimum et maximum par jour, sur 2 jours passés et 7 jours de prévision (aujourd'hui compris).
- Cache d'une heure dans SQLite. En cas de panne, la dernière valeur reste servie 6 heures, et un exemple archivé sert pour une démo hors ligne.
- Contrôles à la réception : unités, fuseau horaire, dates consécutives, minimum inférieur au maximum.

### Diapo 22. Architecture et fiabilité

- React 19, Vite et Tailwind dans le navigateur. API Flask. SQLite avec migrations.
- Droits : session Flask, habilitation mairie relue à chaque appel. Sur l'export, un visiteur reçoit 401 et un voyageur 403.
- La facture naît dans la transaction d'acceptation : deux acceptations concurrentes sur les mêmes dates produisent une seule facture.
- `make verifier-documents` contrôle les exemples JSON, les deux exports XML, la DTD, les XSD, des XPath, les rendus et la cohérence entre fiche, carte et JSON-LD.

## Conclusion

### Diapo 23. Bilan des quatre rendus

| Rendu | Réalisé | Preuve à ouvrir |
|---|---|---|
| 1 | JSON Schema du logement (trois schémas sur une base commune). Facture XML avec DTD et XSD | `src/formats/json/`, `src/formats/xml/` |
| 2 | Base SQLite, texte libre → LLM → JSON → base, liens navigables, facture XML depuis un séjour | `src/api/services/logement_prefill.py`, `src/api/services/facture_service.py` |
| 3 | Base peuplée, profil RDFa testé, export XML validé, XPath en ligne, JSON-LD des alentours | `docs/preuves/` |
| 4 | Deux XSLT pour la facture, deux pour le logement, revue de projet | `src/formats/xslt/`, `docs/revue-projet.md` |

### Diapo 24. Limites et suites

Mieux vaut les annoncer que les laisser trouver :

- Pas encore faits : bascule français/anglais, services des villes voisines, météo sur 4 jours avant et 4 jours après, comparaison avec la ville d'origine, alerte de vigilance canicule.
- Données minces en santé (3 pharmacies) et en loisirs (1 lac, 2 piscines). Aucun lieu de fraîcheur recensé pour l'instant.
- Pour vendre l'outil à une autre commune, il faudra sortir La Clusaz du code et des schémas (code postal, code commune, coordonnées).
- Le paiement et le versement de la commission ne sont pas traités. La facture n'est pas une preuve de paiement.

## Annexe A. Où trouver chaque notion du cours

| Notion | Chapitre du cours | Mise en œuvre | Fichier |
|---|---|---|---|
| Document structuré, modèle de document | Du document numérique aux données structurées | Facture et fiche produites à partir d'un modèle | `src/formats/` |
| Formats d'export, contraintes référentielles | Même chapitre, extensions des SGBD | Export XML de la base avec clés | `src/api/services/export_service.py` |
| Capture de données par formulaire et LLM | Même chapitre, complémentarité doc-SGBD | Préremplissage par l'IA | `src/api/services/logement_prefill.py` |
| Nœuds, liens, hypermédia dynamique | Vers les hypermédias | Lieux proches calculés, liens vers l'hôte, la carte et la source | `src/formats/xslt/logement.xsl` |
| JSON, JSON Schema, `$ref` | JSON | Schémas du logement | `src/formats/json/` |
| XML bien formé et valide, DTD, entités paramètres | XML et DTD | DTD de la facture | `src/formats/xml/facture.dtd` |
| XSD : types, restriction, clés | XML Schema | Facture et base | `src/formats/xml/` |
| Validation par programme | XML Schema, API de validation | lxml `assertValid`, vérificateur | `src/api/scripts/verifier_documents.py` |
| XPath | Parcourir les documents | Requêtes en ligne, clés XSD, XSLT | `docs/revue-projet.md` |
| XSLT | Transformer les documents | Quatre feuilles | `src/formats/xslt/` |
| Transformation de JSON par programme | Transformer les documents | Projection JSON vers XML en Python | `src/api/services/logement_documents.py` |
| Liens HTML `<a>` et `<link>` | Liens dans les documents | `link rel="alternate"` | `src/formats/xslt/logement.xsl` |
| RDFa | RDFa | Profil public de l'hôte | `src/api/documents/utilisateur.html` |
| JSON-LD, Linked Data, `@id`, `sameAs` | Liens dans JSON | Graphe des alentours | `src/api/services/logement_documents.py` |

Notions du cours absentes du projet, à connaître si la question tombe : JSON Path, XPointer et XLink, espaces de noms XML, entités générales, feuille de style appelée par `<?xml-stylesheet?>` dans le navigateur.

## Annexe B. Préparer la démo

- La veille, lancer `make dev-demo` sur un dossier neuf, puis `make verifier-documents`. Les numéros de fiche 99 et 100 valent pour une démo générée à neuf.
- Définir `ILAAS_API_KEY` avant `make dev` et faire un essai réel.
- Ouvrir deux fenêtres de navigation distinctes (voyageur et hôte), plus une pour la mairie.
- Garder ouverts l'export XML de la base, le testeur XPath et le validateur Schema.org.
- Si le réseau tombe : « Consulter l'exemple archivé » pour la météo, la liste des lieux à la place des tuiles de carte, les captures de `docs/preuves/`.

## Annexe C. Questions à préparer

Les reproches qu'un professeur exigeant peut faire sont dans `CRITIQUE.md`. Préparer une réponse courte pour chacun.
