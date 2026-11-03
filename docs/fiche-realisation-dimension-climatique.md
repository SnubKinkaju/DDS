# Fiche de réalisation — Localisation et dimension climatique

Date : 4 novembre 2026. Statut : **plan de réalisation, fonctionnalité à développer**.

Cette fiche détaille le point 7 du projet : altitude, ombrage, équipements contre
la chaleur, météo et services proches. Elle précise une V1 réalisable avec
l'application actuelle, puis les extensions possibles. Les noms de routes,
fichiers et colonnes proposés ci-dessous ne désignent pas encore du code existant.

## 1. But de cette partie

Permettre à une personne cherchant un refuge de comprendre **où se trouve un
logement, ce qui peut améliorer son confort pendant la chaleur et quels services
sont accessibles autour**.

L'adresse devient le point de départ : on recherche ses coordonnées, on situe le
logement sur la carte, puis on utilise cette position pour obtenir son altitude,
la météo extérieure et les lieux proches.

Pour le cours de Documents et Données Structurées, ce travail démontre aussi un
parcours complet : réception de données externes, sélection des informations
utiles, validation, stockage, liens entre entités et présentation en documents.

**Le résultat attendu n'est pas une certification de fraîcheur.** Une altitude,
une prévision météo ou un jardin ne permettent pas de garantir la température
intérieure d'un logement. L'application présente les informations disponibles,
leur provenance et leur date, sans inventer un score de confort.

## 2. Ce que l'utilisateur doit pouvoir faire à la fin

### Côté personne qui propose un logement

1. Commencer à écrire son adresse dans le formulaire.
2. Choisir une suggestion appartenant à La Clusaz.
3. Vérifier la position proposée sur une petite carte.
4. Renseigner l'ombrage extérieur et sélectionner les équipements disponibles.
5. Publier son annonce avec les contrôles habituels.
6. Retrouver ensuite l'altitude et le contexte autour de son logement, lorsqu'ils
   sont disponibles.

Une description passée par l'IA suit le même parcours : une rue extraite du texte
reste une proposition à vérifier. Le LLM n'invente ni coordonnées ni altitude.

### Côté personne qui cherche un logement

1. Voir les logements publiés sur la page **Carte**.
2. Cliquer sur un marqueur pour ouvrir une annonce.
3. Consulter une section **Fraîcheur et environnement** dans la fiche logement.
4. Voir l'altitude, les équipements et l'ombrage déclaré.
5. Consulter la météo extérieure des prochains jours.
6. Retrouver quelques services proches, avec leur distance indicative et un
   lien vers leur position.

### Exemple de présentation

Les valeurs ci-dessous sont **illustratives**, pas des observations réelles :

> **Fraîcheur et environnement**
>
> Altitude du terrain : environ 1 100 m — source IGN.
>
> Extérieur partiellement ombragé en été — renseigné par l'hébergeur.
>
> Équipements déclarés : volets, ventilateur.
>
> Prévisions extérieures : maximum 24 °C, minimum 15 °C demain.
>
> Autour du logement : point d'eau potable recensé à 300 m, arrêt de bus à 450 m.
>
> Distances à vol d'oiseau. Sources et dates de récupération accessibles.

## 3. Point de départ dans le dépôt

| Élément | Existant | Travail à faire |
|---|---|---|
| Adresse | `adresse` contient rue, code postal et ville | Ajouter la recherche d'adresses et la vérification de la localisation |
| Commune | Formulaire limité à La Clusaz, code postal 74220 | Vérifier la commune du résultat géographique, pas seulement son code postal |
| Logement | Publication, modification, masquage, photos et équipements | Ajouter sa localisation et les informations climatiques utiles |
| Carte | `MapPage.jsx` intègre une carte OSM dans une iframe | La remplacer par une carte pilotée par les données de l'application |
| Équipements | Ventilateur, Climatisation, Volets, Jardin et Terrasse existent déjà | Réutiliser ce catalogue et les associations existantes |
| Documents | JSON Schema, fiche HTML/texte, profil utilisateur RDFa | Étendre les documents du logement avec les nouvelles données |
| Backend | Flask, services, repositories SQL et clients externes | Ajouter les intégrations géographiques sans changer d'architecture |
| Base | SQLite, migrations appliquées jusqu'à `004_facturation.sql` | Ajouter des migrations, sans modifier celles déjà appliquées |

Fichiers de départ :

- [Formulaire React](../src/web/src/components/listings/ListingForm.jsx).
- [Page Carte](../src/web/src/pages/MapPage.jsx).
- [Fiche logement](../src/web/src/pages/ListingDetailPage.jsx).
- [Schéma JSON public](../src/formats/json/logement.schema.json).
- [Définitions JSON partagées](../src/formats/json/logement-commun.schema.json).
- [Schéma SQL initial](../src/db/migrations/001_initial_schema.sql).
- [Catalogue d'équipements](../src/db/migrations/003_equipements.sql).

La [feuille de route générale](feuille-de-route.md) contient des propositions
plus ambitieuses et d'anciens numéros de migrations. **Pour ce lot, utiliser le
découpage de cette fiche et les prochains numéros réellement disponibles.**

## 4. Sources de données retenues

| Besoin | Source proposée | Information récupérée | Limite à prendre en compte |
|---|---|---|---|
| Adresse et position | IGN / Géoplateforme, données de la Base Adresse Nationale | Adresse normalisée, coordonnées et informations sur le résultat | Un résultat peut désigner une rue entière plutôt qu'un bâtiment |
| Altitude | API altimétrique IGN | Altitude du terrain à une position | Ce n'est ni l'étage ni la hauteur du logement |
| Lieux proches | OpenStreetMap via Overpass | Objets cartographiés selon leur catégorie et leur position | Couverture variable, informations parfois manquantes |
| Météo extérieure | Open-Meteo | Prévisions de températures, dates et unités | Prévisions de modèle, pas une mesure à l'intérieur du logement |
| Ombrage et équipements | Hébergeur | Description de son propre logement | Information déclarative, à présenter comme telle |

### 4.1 Adresse et géocodage

Le **géocodage** consiste à transformer une adresse en coordonnées géographiques.
Le service IGN fournit cette recherche et permet de proposer des suggestions.
Utiliser le service actuel de la Géoplateforme, pas l'ancienne URL de l'API BAN.
[Documentation du géocodage IGN](https://cartes.gouv.fr/aide/fr/guides-utilisateur/utiliser-les-services-de-la-geoplateforme/geocodage/).

Point d'entrée à utiliser : `https://data.geopf.fr/geocodage/search`.
Le code INSEE utilisé lors de l'essai de La Clusaz est **74080** ; le code postal
du formulaire est **74220**. Le filtre communal doit porter sur le code INSEE.

### 4.2 Altitude

L'API IGN peut calculer une altitude à partir de coordonnées. La ressource
`ign_rge_alti_wld` a été utilisée dans l'essai technique.
[Documentation du calcul altimétrique](https://cartes.gouv.fr/aide/fr/guides-utilisateur/utiliser-les-services-de-la-geoplateforme/calcul-altimetrique/).

Conserver la valeur numérique et sa source, mais afficher une valeur arrondie en
mètres. Vérifier les valeurs signalant une absence de donnée avant stockage.

### 4.3 Services proches

Overpass permet d'interroger une sélection des données OSM selon les catégories
et la zone géographique. Il ne faut pas télécharger toute la carte pour obtenir
les lieux utiles. [Documentation Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API).

Commencer avec trois catégories :

- Points d'eau explicitement recensés comme potables : `amenity=drinking_water`.
- Pharmacies : `amenity=pharmacy`.
- Arrêts de bus : `highway=bus_stop`.

Une fontaine décorative n'est pas automatiquement un point d'eau potable. Un
arrêt recensé ne garantit pas une desserte à toute heure. Les horaires, lorsqu'ils
seront ajoutés, devront être traités séparément.

### 4.4 Météo

Open-Meteo permet de demander des prévisions à partir d'une latitude et d'une
longitude. Pour cette V1, demander les températures minimales et maximales
journalières sur les sept prochains jours, avec le fuseau `Europe/Paris`.
[Documentation météo](https://open-meteo.com/en/docs).

Son accès gratuit est prévu pour un usage non commercial, avec attribution et
limites de requêtes. Cela convient à la démonstration universitaire ; vérifier les
conditions si l'application devient un service commercial.
[Conditions Open-Meteo](https://open-meteo.com/en/terms).

### 4.5 Carte affichée

Utiliser **Leaflet**, isolé dans un composant React, pour afficher les marqueurs
et leurs fiches. Le fond de carte peut provenir d'OpenStreetMap.
[Guide Leaflet](https://leafletjs.com/examples/quick-start/index.html).

Conserver les crédits visibles et respecter les règles du fournisseur de tuiles,
notamment l'absence de téléchargement massif des images de la carte.
[Règles des tuiles OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/).

### 4.6 Vérifications exploratoires déjà réalisées

Pendant la préparation de cette fiche :

- La recherche d'une adresse publique de La Clusaz a renvoyé des coordonnées.
- Le service IGN a renvoyé une altitude pour cette position.
- Open-Meteo a renvoyé sept jours de prévisions.
- La requête de lieux proches Overpass a dépassé le délai d'attente.

Ces essais confirment la faisabilité de plusieurs appels, mais **ne constituent
pas une validation de toute la couverture locale ni de la disponibilité future**.
L'import des lieux proches doit encore être vérifié sur les données réelles.

## 5. Périmètre V1 et éléments reportés

### À réaliser dans ce lot

- Recherche d'adresse limitée à La Clusaz et position vérifiée.
- Carte des logements publiés et localisés.
- Altitude du terrain obtenue automatiquement.
- Ombrage extérieur renseigné par l'hébergeur.
- Mise en valeur des équipements déjà présents dans le catalogue.
- Petit catalogue partagé de services proches, avec distances indicatives.
- Météo extérieure datée, avec cache.
- JSON validés, GeoJSON de la carte et enrichissement RDFa de la fiche logement.

### À garder pour plus tard

- Rôle administrateur de mairie, modération et export XML global des factures.
- Calcul d'itinéraires et temps de marche réels.
- Calcul automatique de l'ombre selon le relief, les arbres, les bâtiments et l'heure.
- Température intérieure mesurée, capteurs et score thermique.
- Comparaisons climatiques historiques avec Lyon ou Annecy.
- Gestion d'épisodes de canicule et alertes officielles.
- Import de tous les commerces, activités touristiques et horaires détaillés.

La V1 conserve SQLite. On ne crée pas une table pour chaque équipement ni un
système géographique complexe pour quelques logements et lieux locaux.

## 6. Parcours de l'adresse à la localisation

### 6.1 Pendant la saisie

1. L'utilisateur écrit dans **Rue et numéro**.
2. Après quelques caractères et une courte pause, React demande des suggestions
   au backend. Valeurs de départ proposées : trois caractères, 300 ms, cinq résultats.
3. Flask interroge IGN avec le filtre communal et renvoie une réponse simplifiée.
4. L'utilisateur sélectionne une suggestion.
5. Une petite carte montre la position et demande de vérifier qu'elle correspond
   au logement.

Une modification du texte après sélection invalide cette sélection. Les réponses
d'une ancienne recherche doivent être ignorées : elles ne doivent pas remplacer
les résultats de la recherche en cours.

### 6.2 Avant enregistrement

Le navigateur transmet l'adresse et, si disponible, la référence sélectionnée.
Le serveur résout ou revérifie le résultat avec IGN : il ne prend pas pour preuve
des coordonnées arbitraires envoyées par le navigateur.

Contrôles attendus :

- Commune du résultat : La Clusaz.
- Coordonnées numériques, finies et dans les plages géographiques valides.
- Cohérence entre l'adresse sélectionnée et l'adresse enregistrée.
- Résultat suffisamment précis pour représenter un logement.

Un résultat « commune » ne devient pas la position du logement. Un résultat
limité à une rue nécessite une adresse plus précise ; aucun marqueur exact ne doit
être inventé. Le déplacement manuel du marqueur pourra être ajouté plus tard,
avec ses propres contrôles de territoire.

### 6.3 Si la localisation échoue

Pour conserver le fonctionnement actuel, la publication manuelle peut rester
possible avec une adresse déclarée à La Clusaz, mais sans position vérifiée.
L'hébergeur voit **Localisation à compléter** et peut relancer la recherche.

Le logement reste dans le catalogue, mais n'apparaît pas sur la carte et ne reçoit
pas de résultats de proximité. On ne le place jamais au centre de la commune
par défaut. Une panne météo ou altitude ne bloque pas non plus la publication.

### 6.4 Si l'adresse change

Invalider ensemble l'ancienne position et l'altitude liée à cette position.
La météo et les distances suivantes utilisent uniquement la nouvelle localisation
vérifiée. Les anciennes factures, dont le contexte est figé, restent inchangées.

## 7. Données à ajouter, au minimum

Cette proposition sert de base à la prochaine migration ; elle n'impose pas
d'ajouter tous les champs avant de commencer la première étape.

### 7.1 Localisation du logement

Conserver l'adresse postale dans `adresse`. Placer la localisation du bien dans
`logement`, pour ne pas mélanger sa position avec l'adresse personnelle d'un utilisateur.

| Champ proposé | Rôle |
|---|---|
| `latitude`, `longitude` | Coordonnées WGS84, nulles tant que la localisation n'est pas vérifiée |
| `geo_reference` | Identifiant du résultat chez le fournisseur, lorsqu'il existe |
| `geo_source` | Origine de la position, par exemple IGN/BAN |
| `geo_precision` | Précision retenue, distincte d'un simple score de recherche |
| `geo_verifie_le` | Date de vérification de la position |

Contraintes : latitude entre -90 et 90, longitude entre -180 et 180, et deux
coordonnées présentes ensemble ou toutes les deux absentes. Une plage mondiale
valide ne suffit pas à prouver que le logement est dans la commune.

### 7.2 Altitude et ombrage

| Champ proposé dans `logement` | Rôle |
|---|---|
| `altitude_m` | Altitude du terrain, nullable |
| `altitude_source` | Fournisseur et ressource utilisés |
| `altitude_collectee_le` | Date de récupération |
| `ombrage_exterieur` | `non_renseigne`, `aucun`, `partiel`, `important` |

Le libellé du formulaire précise : **Ombrage de l'extérieur accessible, en été**.
Sans information, conserver `non_renseigne` ; ce n'est pas équivalent à `aucun`.
L'interface présente cette donnée comme déclarée par l'hébergeur.

Réutiliser `equipement` et `logement_equipement` pour les volets, ventilateurs,
climatisation, jardin et terrasse. Avoir un jardin ou une terrasse ne signifie
pas qu'ils sont ombragés. Aucune déduction automatique entre ces champs.

### 7.3 Une table commune de points d'intérêt

Table proposée : `point_interet`.

| Champs | Rôle |
|---|---|
| `id` | Identifiant interne |
| `categorie` | Point d'eau, pharmacie ou arrêt de bus |
| `nom` | Nom facultatif ; sinon afficher un libellé de catégorie |
| `latitude`, `longitude` | Position exploitable pour la carte et les distances |
| `source`, `source_id`, `source_url` | Origine et lien vers l'objet source |
| `date_collecte`, `actif` | Suivi des imports et disponibilité dans notre catalogue |

Prévoir l'unicité du couple `(source, source_id)`. Pour OSM, conserver le type
d'objet dans la référence, par exemple `node/123` : un numéro seul ne suffit pas.

Un même lieu peut être proche de plusieurs logements : **ne pas le dupliquer
par logement et ne pas créer une association stockée pour chaque distance**.
Les distances seront calculées à la consultation.

### 7.4 Un cache de prévisions

Table légère proposée : `cache_environnement`, avec une clé de requête,
un document JSON normalisé, une date de collecte et une date d'expiration.

La clé distingue au minimum le fournisseur, les coordonnées demandées, les
variables météo et le fuseau. Le document conservé est validé avant écriture.
Ce cache peut être reconstruit : ce n'est pas une nouvelle source de vérité pour
les caractéristiques du logement.

On ne crée pas de table de mesures de température intérieure ni de table
d'historique climatique dans cette V1.

## 8. Organisation du backend et routes proposées

Conserver l'architecture actuelle :

```text
React → routes Flask → services → repositories → SQLite
                         ↓
                    integrations
                    IGN / OSM / Open-Meteo
```

| Emplacement proposé | Responsabilité |
|---|---|
| `src/api/integrations/ign.py` | Requêtes de géocodage et d'altitude |
| `src/api/integrations/overpass.py` | Lecture des objets OSM utiles |
| `src/api/integrations/open_meteo.py` | Lecture des prévisions |
| `src/api/services/localisation_service.py` | Vérification de l'adresse et de la position |
| `src/api/services/environnement_service.py` | Assemblage de l'altitude, des lieux proches et de la météo |
| `src/api/repositories/point_interet_repository.py` | Persistance des lieux importés |
| `src/api/repositories/cache_repository.py` | Lecture et renouvellement du cache |
| `src/api/scripts/import_points_interet.py` | Import explicite du catalogue local |

Créer ces modules au fur et à mesure des étapes. Les clients externes gèrent les
requêtes et les erreurs réseau ; les services décident quelles données accepter.
Les repositories continuent à contenir seulement les requêtes SQL.

| Route proposée | Usage | Accès |
|---|---|---|
| `GET /api/adresses?q=...` | Suggestions normalisées limitées à La Clusaz | Utilisateur connecté |
| `POST /api/logements` / `PUT /api/logements/{id}` | Conserver les routes existantes et traiter la référence d'adresse optionnelle | Création connectée / propriétaire |
| `POST /api/logements/{id}/localisation` | Relancer explicitement la localisation d'une adresse existante | Propriétaire du logement |
| `GET /api/logements/carte` | Logements publiés et localisés, au format GeoJSON | Public |
| `GET /api/logements/{id}/environnement` | Altitude, lieux proches et météo, avec provenance et état de disponibilité | Public si annonce publiée |
| `GET /api/points-interet` | Catalogue local actif au format GeoJSON | Public |

Les routes ne doivent pas servir de proxy ouvert : pas d'URL de fournisseur
arbitraire ni de requête Overpass libre envoyée par le navigateur. Les catégories
et les limites géographiques sont définies côté serveur.

Les appels distants ne doivent pas maintenir une transaction SQLite ouverte.
Collecter et contrôler la réponse, puis effectuer une écriture courte. Une réponse
tardive calculée pour une ancienne adresse ne doit pas être attachée à la nouvelle.

## 9. Import, proximité et renouvellement

### Catalogue des lieux

Importer les catégories retenues sur une zone couvrant la commune et une petite
marge autour de ses limites. Ainsi, un service juste hors de la commune peut
rester pertinent pour un logement situé près de la frontière communale.

Prévoir une commande simple, par exemple `make import-poi`, à ajouter seulement
quand le script existera. L'import doit être reproductible et relançable sans
doublons. Une fréquence hebdomadaire est suffisante comme point de départ pour la V1.

En cas d'échec ou de réponse incomplète, garder le dernier catalogue valide.
Ne désactiver les objets absents qu'après un import complet et validé de la même
zone et des mêmes catégories. Contrôler aussi les erreurs contenues dans une
réponse HTTP pourtant réussie.

### Distances

Pour quelques lieux locaux, SQLite et un calcul de distance en Python suffisent.
Un premier filtrage géographique peut réduire la liste avant le calcul.

Valeurs proposées pour l'affichage : rayon de **2 km**, maximum **trois lieux
par catégorie**, triés du plus proche au plus éloigné. Ces valeurs sont des
choix de V1, pas des caractéristiques des fournisseurs.

Afficher **distance à vol d'oiseau**. Ne pas convertir automatiquement cette
distance en minutes de marche, particulièrement en montagne. Les positions
représentant le centre d'une surface restent approximatives.

### Fréquences et cache proposés

| Donnée | Quand la récupérer ou la renouveler |
|---|---|
| Suggestions d'adresse | Pendant la saisie, avec temporisation et petit cache de courte durée |
| Position du logement | À la validation de l'adresse, à sa modification ou lors d'une relance explicite |
| Altitude | Après validation de la position ; recommencer si celle-ci change |
| Lieux proches | Import partagé, hebdomadaire au départ ; lecture locale à la consultation |
| Prévisions météo | À la demande sur une fiche, avec un cache d'environ une heure |

Si la météo est temporairement indisponible, une réponse en cache peut être
affichée comme ancienne pendant une durée limitée, proposée à six heures.
Au-delà, afficher une indisponibilité. Ne jamais remplacer une absence par 0 °C.

Pour un séjour hors de l'horizon des prévisions, afficher la météo des prochains
jours avec ses dates ; ne pas la présenter comme celle du futur séjour.

## 10. Présentation dans React

### Formulaire

- Un composant `AddressAutocomplete` pour les suggestions, utilisable au clavier.
- Une petite carte de confirmation après sélection d'une adresse exploitable.
- Un champ d'ombrage simple et les équipements existants.
- Un message si la localisation reste à compléter.

Le préremplissage IA conserve son rôle actuel. Il peut proposer une rue ou des
équipements mentionnés explicitement ; il ne contourne pas le géocodage. Si le
champ d'ombrage est ajouté à son schéma partiel, sa valeur doit venir du texte et
rester modifiable avant publication.

### Page Carte

- Remplacer l'iframe par un composant Leaflet réutilisable.
- Charger uniquement les logements publiés possédant une position vérifiée.
- Afficher un résumé dans chaque marqueur : titre, capacité, prix et lien vers la fiche.
- Ajouter ensuite des catégories activables pour les points d'intérêt.
- Afficher un état vide si aucun logement n'est localisé.
- Conserver le lien vers le catalogue et les crédits du fond de carte.

### Fiche logement

Créer une section **Fraîcheur et environnement**, sans multiplier les pages :

- Informations durables : altitude, ombrage déclaré, équipements utiles.
- À proximité : quelques lieux par catégorie et leurs distances indicatives.
- Météo : températures minimales et maximales, dates des prévisions et actualisation.

Chaque bloc a son propre état de chargement ou d'indisponibilité. Une panne météo
ne doit pas masquer les équipements, les lieux déjà en cache ou la réservation.

## 11. Documents structurés et démonstration du cours

### JSON et JSON Schema

Étendre les schémas avec des définitions communes de coordonnées et d'ombrage.
Mettre à jour la saisie complète, le préremplissage partiel et le document public
sans rendre obligatoires des informations absentes des anciennes annonces.

Le document de logement porte les caractéristiques durables. La réponse
`environnement` porte les prévisions et lieux calculés, afin de ne pas déclencher
tous les appels externes pour chaque ligne du catalogue.

Pour chaque source externe :

1. Vérifier que la réponse HTTP et son contenu sont exploitables.
2. Extraire uniquement les champs nécessaires.
3. Normaliser noms de champs, unités et dates.
4. Valider notre document normalisé avec JSON Schema.
5. Conserver la source et la date de récupération.

### GeoJSON

Utiliser une `FeatureCollection` avec une géométrie `Point` pour chaque logement
ou lieu affiché. GeoJSON emploie l'ordre **longitude, latitude**, en WGS84 ; cet
ordre doit être converti correctement lors de l'affichage avec Leaflet.
[Spécification GeoJSON, RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946).

Les propriétés des marqueurs contiennent seulement les informations publiques
nécessaires et le lien vers l'annonce. Un logement sans position est omis de la
collection, sans coordonnées fictives.

### RDFa et HTML

Enrichir la fiche HTML du **logement** avec une entité représentant le lieu et
un objet `GeoCoordinates` pour sa latitude et sa longitude. Les propriétés
`geo` et `address` sont prévues par schema.org pour les lieux.
[Place](https://schema.org/Place), [GeoCoordinates](https://schema.org/GeoCoordinates).

La position appartient au logement, pas à la personne qui le propose. Conserver
la fiche propriétaire actuelle et relier les ressources par des liens explicites.

Le HTML généré côté Flask doit permettre de vérifier le RDFa directement, comme
pour le profil actuel. Tester l'extraction des coordonnées et leur rattachement
au bon logement avec un validateur. Pour l'altitude, conserver sa source et son
référentiel ; vérifier la correspondance sémantique avant d'ajouter une propriété RDFa.

### XML et factures

Les factures conservent leur chaîne XML → XSD → XSLT déjà réalisée. Ne pas injecter
la météo du jour dans un document de facture figé. Un export XML du territoire
pourra compléter le travail plus tard ; il n'est pas nécessaire au fonctionnement
de cette V1 et ne remplace pas le futur export global des factures.

## 12. Réalisation par étapes

Chaque étape produit un résultat utilisable avant de commencer la suivante.

### Étape 1 — Adresse fiable et stockage des coordonnées

**But :** un logement peut être rattaché à une position vérifiée.

- [ ] Ajouter une migration de localisation avec colonnes nullables et contraintes.
- [ ] Créer le client IGN, la recherche de suggestions et la vérification serveur.
- [ ] Brancher les suggestions dans le formulaire de création et de modification.
- [ ] Afficher la carte de confirmation et traiter les résultats imprécis.
- [ ] Invalider la localisation lorsque l'adresse change.
- [ ] Adapter les schémas JSON et les exemples.
- [ ] Vérifier une adresse réelle, une adresse inconnue, une mauvaise commune et une panne.

**Terminé quand :** une adresse choisie à La Clusaz produit des coordonnées
persistées, relues correctement après rechargement. Une adresse incertaine ne
produit aucun point présenté comme exact.

### Étape 2 — Carte des annonces

**But :** la page Carte représente les données de notre application.

- [ ] Ajouter Leaflet et isoler son intégration dans un composant React.
- [ ] Exposer les annonces publiées et localisées en GeoJSON.
- [ ] Afficher les marqueurs et les liens vers les fiches.
- [ ] Gérer l'état vide, l'erreur de chargement et les dimensions mobiles.
- [ ] Vérifier qu'une annonce masquée disparaît également de la carte.

**Terminé quand :** créer, modifier ou masquer une annonce change la carte après
actualisation, sans retoucher manuellement les marqueurs.

### Étape 3 — Altitude, ombrage et équipements

**But :** rendre visibles les informations climatiques durables du logement.

- [ ] Ajouter les colonnes d'altitude, de provenance et d'ombrage.
- [ ] Récupérer l'altitude à partir de la position vérifiée.
- [ ] Traiter une réponse sans altitude exploitable.
- [ ] Ajouter le champ d'ombrage au formulaire et aux schémas.
- [ ] Réutiliser les équipements existants et les présenter dans la fiche.
- [ ] Distinguer les données IGN des déclarations de l'hébergeur.

**Terminé quand :** la fiche affiche une altitude sourcée lorsqu'elle est
disponible, ainsi que les déclarations enregistrées, avec un état inconnu explicite.

### Étape 4 — Services proches

**But :** donner un contexte pratique autour du logement.

- [ ] Ajouter la table `point_interet` et son repository.
- [ ] Vérifier une requête Overpass réelle sur la zone retenue.
- [ ] Écrire l'import reproductible des trois catégories et sa commande Make.
- [ ] Calculer et trier les distances à partir de la position du logement.
- [ ] Afficher les lieux proches dans la fiche et leurs marqueurs sur la carte.
- [ ] Vérifier doublons, noms manquants, import en échec et absence de résultat.

**Terminé quand :** deux logements partagent le même catalogue local mais
obtiennent des classements de proximité adaptés à leurs positions.

### Étape 5 — Météo et cache

**But :** afficher une météo utile sans dépendre d'un appel externe à chaque visite.

- [ ] Ajouter le client Open-Meteo et normaliser les données journalières.
- [ ] Ajouter le cache et ses dates de collecte/expiration.
- [ ] Afficher sept jours de prévisions extérieures avec les unités.
- [ ] Gérer les valeurs absentes, les erreurs et les réponses anciennes.
- [ ] Éviter les renouvellements simultanés inutiles pour une même requête.
- [ ] Vérifier qu'un séjour lointain ne reçoit pas de fausses prévisions à ses dates.

**Terminé quand :** la fiche affiche des prévisions datées, une seconde
consultation réutilise le cache et une panne ne bloque pas le reste de l'annonce.

### Étape 6 — Documents, vérification et démonstration finale

**But :** rendre le parcours compréhensible et démontrable pour le cours.

- [ ] Finaliser les schémas JSON du logement, du GeoJSON et de l'environnement.
- [ ] Mettre à jour les fiches HTML/texte et les annotations RDFa pertinentes.
- [ ] Vérifier une extraction RDFa du logement localisé.
- [ ] Mettre à jour le DBML, les exemples et le README.
- [ ] Préparer quelques logements de démonstration avec des adresses vérifiées.
- [ ] Documenter les sources, les limites et les résultats des vérifications.

**Terminé quand :** on peut suivre une même information depuis l'API source
jusqu'à sa valeur stockée, son JSON validé et sa présentation HTML/RDFa.

## 13. Vérifications à prévoir

Les contrôles s'effectuent sur une base temporaire ou une base de démonstration.
La fiche n'impose pas d'ajouter un framework de tests au dépôt. Pour les erreurs
réseau, utiliser des réponses simulées ; vérifier aussi un appel réel à chaque source.

| Cas | Résultat attendu |
|---|---|
| Adresse réelle sélectionnée à La Clusaz | Position enregistrée et marqueur au bon endroit |
| Code postal correct mais autre commune | Résultat non accepté comme localisation de La Clusaz |
| Rue seule ou résultat ambigu | Demande de précision, aucun faux point de bâtiment |
| Coordonnées falsifiées envoyées par le client | Serveur ne les accepte pas comme position vérifiée |
| Adresse modifiée | Ancienne position et ancienne altitude invalidées |
| Adresse produite par l'IA | Même vérification géographique que la saisie manuelle |
| Annonce masquée | Absente des routes publiques de carte et d'environnement |
| Import des lieux lancé deux fois | Pas de doublon |
| Import interrompu ou incomplet | Dernier catalogue valide conservé |
| Lieu sans nom | Libellé de catégorie, aucun nom inventé |
| Aucun lieu connu à proximité | « Aucun lieu recensé dans ce rayon », pas « Aucun service n'existe » |
| Météo indisponible | Cache daté si encore utilisable, sinon message explicite |
| Température égale à 0 °C | Valeur affichée normalement, distincte d'une donnée manquante |
| Inversion latitude/longitude | Détectée par un contrôle sur un point connu |
| Ombrage non renseigné | Affiché comme inconnu, jamais comme absence d'ombre |
| Facture émise avant un changement d'adresse | Son contenu figé reste identique |
| Navigation au clavier et écran mobile | Suggestions, marqueurs et fiches utilisables |

Les logements générés par le script de peuplement actuel utilisent des adresses
fictives ou combinées aléatoirement. **Ne pas leur attribuer des coordonnées
aléatoires pour remplir la carte.** Pour la démonstration, préparer quelques
adresses publiques vérifiées et identifier clairement les annonces fictives.

## 14. Scénario de démonstration au professeur

1. Ouvrir le formulaire et sélectionner une adresse proposée à La Clusaz.
2. Montrer la position, renseigner l'ombrage et choisir les équipements.
3. Publier et retrouver le logement sur la carte.
4. Ouvrir sa fiche : altitude, services proches et prévisions météo.
5. Afficher le JSON de l'annonce puis le GeoJSON de la carte.
6. Expliquer les contrôles et montrer la source et la date d'une donnée externe.
7. Extraire les annotations RDFa du lieu depuis sa fiche HTML.
8. Simuler une API indisponible et montrer que l'annonce reste consultable.

Le fil conducteur à expliquer est : **une adresse relie le logement à des données
de territoire ; ces données sont contrôlées, conservées et présentées sous
plusieurs formes structurées**.

## 15. Première action à réaliser

Commencer uniquement par **l'étape 1 : adresse et coordonnées**. C'est la
dépendance commune de la carte, de l'altitude, de la météo et des recherches de
proximité. Une fois ce parcours validé, réaliser les étapes suivantes une par une.

À ce stade, cette fiche est le livrable : aucune migration ni intégration
climatique n'a été appliquée par sa rédaction.
