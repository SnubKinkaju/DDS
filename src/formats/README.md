# Documents de la nouvelle application

Ce dossier décrit les documents échangés par la V1. Le prototype DDS conserve
ses propres schémas dans `src/server/schema` jusqu'au portage des factures.

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
Jinja de `src/api/documents`. **XSLT sera utilisé pour les factures XML**.
Le RDFa sera ajouté lors du travail sur la fiche publique d'utilisateur.

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
