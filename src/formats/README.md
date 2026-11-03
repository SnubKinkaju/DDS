# Documents de la nouvelle application

Ce dossier décrit les documents échangés par la V1. Le prototype DDS conserve
ses propres schémas dans `src/server/schema`. Les nouveaux formats de facture
décrits ici sont adaptés aux réservations, utilisateurs et logements de la V1.

## Logement : de la saisie au document

```text
Formulaire React → JSON de saisie → JSON Schema → SQLite
SQLite → document JSON public → JSON Schema → API / fiche HTML / texte
```

| Fichier | Utilisation |
|---|---|
| `../api/schemas/create-logement.schema.json` | Valide le JSON envoyé pour créer ou modifier un logement |
| `json/logement.schema.json` | Valide le document complet renvoyé par `GET /api/logements/{id}` |
| `json/logement-commun.schema.json` | Partage les règles de titre, description, adresse, type, capacité et prix via `$ref` |
| `json/logement-partiel.schema.json` | Valide les informations extraites d'une description libre, avec des champs facultatifs |
| `examples/creation-logement.json` | Exemple de saisie valide |
| `examples/logement.json` | Exemple de document public valide |
| `examples/logement-invalide.json` | Contre-exemple : prix négatif, qui doit être refusé |

Le JSON de saisie contient des identifiants d'équipements. Le serveur ajoute
ensuite l'identifiant du logement, son statut, l'identité publique de l'utilisateur
qui le propose, les photos et les équipements avec leurs libellés.

Le schéma public concerne **une annonce publiée**, pas la liste résumée du
catalogue ni les réponses privées de gestion. Il ne permet pas d'ajouter l'email,
le mot de passe ou l'adresse personnelle de l'utilisateur. `proprietaire`
désigne ici l'utilisateur lié au logement, pas une table distincte.

Les `$id` sous `https://refuge.example/` sont des identifiants de schéma, pas un
site déployé. Python résout les `$ref` dans un registre de fichiers locaux,
sans connexion réseau. Pour un autre validateur, fournir aussi le schéma commun.
Les fichiers sont consultables sous `/api/formats/json/{nom-du-schema}`.

## Texte libre : une proposition avant publication

```text
Description libre → ILaaS → JSON partiel → JSON Schema + contrôle des équipements
                                        → formulaire modifiable → publication habituelle
```

Le schéma partiel reprend les mêmes règles de champs via `$ref`, mais ne possède
pas de liste `required`. Par exemple, `{"typeLogement":"chalet","capacite":4}`
est une proposition valide ; ce n'est pas encore un logement publiable. Les valeurs
inconnues sont omises, sans `null` ni défaut inventé. Une adresse peut être partielle.
La ville et le code postal restent ceux déjà fixés par le formulaire : La Clusaz,
74220. Le modèle ne doit pas transformer une autre ville en La Clusaz.

Le prix est en centimes dans le JSON et en euros dans le formulaire. Les équipements
doivent appartenir au catalogue SQL. La consigne demande au modèle d'extraire les
faits présents et permet de reformuler le titre et la description sans ajouter de
caractéristiques. **Le schéma contrôle la forme, pas la véracité du texte** :
l'utilisateur doit relire la proposition avant de publier.

Un échec ne modifie pas le formulaire. Une proposition valide ne crée aucune
ligne en base : seul le bouton de publication déclenche l'enregistrement après
validation par `create-logement.schema.json` et les contrôles métier existants.

## Présentations du document

Depuis la fiche React, ouvrir **Documents du logement** :

- **Données JSON** : `/api/logements/{id}`. L'en-tête HTTP `Link`, relation
  `describedby`, indique le schéma correspondant.
- **Fiche HTML / impression** : `/api/logements/{id}/fiche.html`.
  Le bouton d'impression utilise une mise en page A4 sans navigation ni photos.
- **Texte imprimable** : `/api/logements/{id}/fiche.txt` ; ajouter
  `?telecharger=1` pour télécharger le fichier.

Les trois présentations relisent le même document depuis SQLite et le valident.
Un logement masqué ou supprimé renvoie 404. Un document de sortie incorrect
renvoie 500 et les détails sont consignés côté serveur. Une saisie incorrecte
reste une erreur 400 : ce sont deux contrôles distincts.

La transformation JSON → HTML/texte est réalisée par Python et les gabarits
Jinja de `src/api/documents`. Les factures, elles, utilisent **XML et XSLT**.
La fiche publique d'utilisateur utilise RDFa avec le vocabulaire schema.org.

## Facture : XML validé et transformations XSLT

```text
SQLite → document de facture → validation JSON Schema + règles métier
                             → XML → validation XSD → XSLT → HTML / texte
```

| Fichier | Rôle |
|---|---|
| `json/facture.schema.json` | Document JSON complet, identités figées, séjour et montants |
| `xml/facture.xsd` | Structure et types du XML, dates, montants positifs ou nuls, statuts |
| `xslt/facture.xsl` | Présentation HTML avec parties, logement, séjour, lignes et commission |
| `xslt/facture-texte.xsl` | Présentation différente en texte brut |
| `xslt/facture-commun.xsl` | Templates partagés de formatage des dates et des euros |
| `../api/documents/facture.css` | Style écran et impression A4, inclus dans le HTML téléchargé |

La génération est dans `src/api/services/facture_documents.py`. Chaque rendu XML,
HTML ou texte passe par la validation XSD. Le XSD contrôle la structure ; Python
contrôle les calculs (nuits × tarif, somme des lignes, commission et part nette).
Les montants du JSON et du XML sont en **centimes entiers**. Seul l'affichage
XSLT les convertit en euros. Une adresse personnelle non renseignée n'est pas
inventée : `null` en JSON, élément absent en XML.

Les routes privées suivent `/api/factures/{numero}/document.{json|xml|html|txt}`.
Ajouter `?telecharger=1` pour recevoir un fichier joint. Le XSD public se trouve
à `/api/formats/xml/facture.xsd`. Le XML n'est pas transformé par le navigateur :
la transformation XSLT est exécutée côté Flask avec lxml.

Depuis **Mes réservations → Voir la facture**, React ouvre une fenêtre avec
trois onglets : **Imprimable**, **JSON**, **Texte**. L'onglet imprimable affiche
le HTML produit par XSLT dans une iframe ; React ne reconstruit pas la facture.
On peut télécharger chaque format, exporter le XML ou imprimer la facture seule.
Pour un PDF, sélectionner l'enregistrement PDF dans la boîte d'impression.
Le HTML téléchargé contient ses styles et peut aussi être imprimé hors ligne.

Pour vérifier le parcours : accepter une demande avec l'hébergeur, ouvrir la
facture dans **Demandes reçues**, puis dans **Mes séjours** avec le voyageur.
Comparer le total et la commission dans les trois onglets. Annuler le séjour,
rouvrir la facture : son numéro et ses montants restent identiques, son statut
devient **Annulée**. Une demande en attente ou refusée n'a pas de facture.

## Vérifier

```bash
make verifier-documents
```

La commande ne modifie pas la base. Elle contrôle les deux exemples valides et
le refus du contre-exemple. Les identifiants et la photo des exemples sont
illustratifs : ils ne sont pas insérés dans la base.

Pour une démonstration : publier un logement, ouvrir ses documents, modifier
son prix puis recharger la fiche HTML et le JSON. Les deux reprennent le prix
enregistré. Les montants restent des entiers en centimes dans le JSON ; seules
les présentations les convertissent en euros.
