# Revue de projet — Refuge climatique de La Clusaz

Une personne cherche un hébergement pendant une forte chaleur. Elle peut comparer les protections déclarées, les températures extérieures et les services accessibles autour d’une adresse avant de demander son séjour. L’hébergeur décide de la réservation. La mairie documente les lieux utiles, contrôle la diffusion des annonces et dispose des exports de la plateforme. [Sujet et quatre rendus](<Projet M1 Doc Num Refuge climatique.pdf>)

## Démonstration en huit minutes

Lancer `make dev-demo`, ouvrir [l’application locale](http://localhost:5173) et préparer deux fenêtres de navigation distinctes. Les comptes `voyageur@example.test`, `hote@example.test` et `mairie@example.test` utilisent le mot de passe de démonstration `RefugeDemo2026!`. Les numéros ci-dessous correspondent à la génération initiale.

| Minute | Action | Données ou document à expliquer |
|---|---|---|
| 0–2 | Depuis l’accueil, ouvrir la carte puis comparer [le refuge du village](http://localhost:5173/logements/100) et [le séjour aux Confins](http://localhost:5173/logements/99). | Au village, la pharmacie du Danay est à 123 m à vol d’oiseau. Aux Confins, le point représentant le lac est à 490 m. Le calcul utilise une adresse IGN vérifiée, des lieux sourcés et un rayon de 2 km. Les filtres d’ombre et de volets utilisent les déclarations des hôtes. |
| 2–3 | Depuis la fiche, ouvrir la source d’un lieu, le JSON-LD et la carte. Cliquer sur « Proposé par ». | Le même lieu possède le même identifiant sur plusieurs fiches. La distance appartient à sa relation avec le logement. Le profil de l’hôte porte les propriétés RDFa de `Person`. |
| 3–4 | Dans « Publier un logement », décrire un chalet avec des volets pour quatre personnes. Relire la proposition avant publication. | Le JSON partiel de l’IA passe un premier schéma. Le JSON complet passe le schéma de saisie. L’adresse et les caractéristiques absentes restent à renseigner. Avec un fournisseur indisponible, le formulaire reste utilisable. |
| 4–6 | Avec le voyageur, demander deux nuits libres au refuge du village. Depuis les demandes reçues de l’hôte, accepter. Revenir dans « Mes séjours » et ouvrir la facture. | Une acceptation fige les parties, le prix et les dates. Montrer le même numéro en JSON, XML, texte et HTML imprimable. Les 5 % de commission sont compris dans le montant du voyageur. |
| 6–7 | Avec la mairie, ouvrir « Administration municipale », consulter les volumes par catégorie et télécharger la base XML ou la collection de factures. | L’export de la base conserve les relations entre entités. La collection restitue chaque facture avec les parties renseignées à l’émission. Les autres comptes accèdent à leurs propres séjours. |
| 7–8 | Exécuter les deux XPath ci-dessous puis `make verifier-documents`. | Le testeur en ligne retrouve des éléments. Le vérificateur local compare les comptages avec SQLite et montre pourquoi une date mal formée passe la DTD mais échoue au XSD. |

## Correspondance avec les quatre rendus

| Rendu | Réalisation | Preuve à ouvrir |
|---|---|---|
| 1 · Formats | Annonce en JSON, schéma partagé et schémas de saisie/public. Facture de séjour en XML avec attributs, éléments ordonnés et montants en centimes. | [JSON Schema](../src/formats/json), [DTD](../src/formats/xml/facture.dtd), [XSD](../src/formats/xml/facture.xsd), [exemples](../src/formats/examples) |
| 2 · De la saisie au document | Texte libre → ILaaS → proposition partielle → formulaire → JSON validé → SQLite. Navigation logement → hôte, service → carte, réservation → facture de ce séjour. | [Service de préremplissage](../src/api/services/logement_prefill.py), [émission de la facture](../src/api/services/facture_service.py), [schéma de la BDD](schemas/schema-bdd-v1.dbml) |
| 3 · Base, sémantique et interrogation | Base peuplée, profil RDFa, géographie en GeoJSON, alentours en JSON-LD, deux collections XML validées et XPath en ligne. | [Extraction RDFa du profil](preuves/profil-schema.png), [graphe extrait de la fiche](preuves/fiche-schema.png), [export de la base](../src/formats/xml/base_de_donnees.xsd), [collection de factures](../src/formats/xml/factures.xsd) |
| 4 · Présentations et revue | Deux sorties XSLT pour la facture. Pour le logement, Flask valide le JSON, projette ses données et l’environnement dans un arbre XML puis transforme cet arbre en fiche HTML et en texte. Les présentations HTML disposent d’une mise en page d’impression. | [Feuilles XSLT](../src/formats/xslt), [service des documents logement](../src/api/services/logement_documents.py), [vérificateur reproductible](../src/api/scripts/verifier_documents.py) |

## Deux XPath exécutés en ligne

Les saisies utilisent les exports de la base fictive initiale. Dans le [testeur XPath](https://www.site24x7.com/fr/tools/xpath-evaluateur.html), coller le XML dans le premier champ et l’expression dans le second.

| XML | Expression | Résultat observé |
|---|---|---|
| `factures.xml` | `/factures/facture[1]/emetteur/nom` | Un élément `nom` de valeur « Simon ». [Capture](preuves/xpath-facture.png) |
| `base_de_donnees.xml` | `/baseDeDonnees/lieux/lieu[@categorie="pharmacie"]/nom` | Pharmacie du Danay, Pharmacie du Grand Bornand et Pharmacie des Aravis. [Capture](preuves/xpath-territoire.png) |

Pour refaire rapidement la première manipulation, utiliser [l’extrait de deux factures fictives](preuves/extrait-factures.xml). Pour tester un prédicat métier avec lxml, `/factures/facture[client/nom='Dupont']/@numero` retourne les numéros émis aux clients de ce nom.

## Données et limites de la démonstration

Le scénario initial produit 20 utilisateurs fictifs, 100 logements, 103 demandes et 101 factures, dont une annulée. Trois annonces ont une adresse de référence géolocalisée. L’extrait du 19 novembre 2026 donne 164 objets territoriaux actifs dans la commune et ses abords. L’absence de pharmacie recensée à moins de 2 km d’une fiche décrit la couverture de cet extrait. [Origine et réutilisation des données](../src/db/seeds/territoire/README.md)

La météo concerne le point communal et l’extérieur. L’ombre et les équipements sont déclarés par l’hôte. Les distances utilisent une ligne droite et parfois le centre d’une surface. Une baignade autorisée ou une salle municipale ouverte pendant une canicule demande une source locale précise. Un lieu municipal peut être ajouté avec cette source puis retiré lorsqu’il ferme.

Deux sessions de navigateur ont permis de publier une annonce avec une adresse IGN, réserver deux nuits à 51,05 €, accepter et conserver après annulation la facture de 102,10 € avec 5,11 € de commission. Sur mobile, le compte mairie a téléchargé la collection XML.

La vérification de livraison couvre les formats, les refus d’accès, la réservation concurrente, la modération, les pannes de fournisseurs et les parcours React sur ordinateur et mobile. Le parcours ILaaS a été exercé avec réponses simulées et clé absente. La réponse réelle du modèle reste à essayer avec une clé de cours configurée sur le serveur.
