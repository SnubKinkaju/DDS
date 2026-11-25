# Critique du projet Refuge climatique

Le point de vue d'un professeur qui a tout lu et qui n'est pas de bonne humeur.

J'ai lu votre dépôt en entier : le README de 20 Ko, le plan de version finale, les 648 lignes de la fiche climatique, puis le code. Je sais donc ce que vous avez promis, et j'ai vérifié ce que vous avez livré. Je cite vos fichiers pour que personne ne me réponde que j'ai mal lu.

## 1. Où est le refuge climatique ?

Le sujet parle de personnes qui fuient la canicule. Dans tout votre code, Python, React et SQL confondus, le mot « canicule » apparaît une seule fois, dans une phrase d'accroche de `HomePage.jsx`. Il n'y a ni alerte de vigilance, ni activation des offres pendant un épisode de chaleur, ni priorité pour les personnes vulnérables, ni prix solidaire. Votre `choix-de-la-ville.md` promettait pourtant des offres « activées ou mises en avant pendant les épisodes de forte chaleur » et des « prix solidaires ou des offres gratuites » pour les personnes vulnérables.

Pour votre application, un réfugié climatique venu de Lyon et un skieur en vacances de février sont le même utilisateur. Enlevez le bloc météo et les deux filtres « Volets » et « Extérieur ombragé » : il reste une plateforme de location pour station de ski.

La catégorie « lieu de fraîcheur » existe dans la base, mais la démo n'en contient aucun. Votre page d'accueil affiche pourtant le lien « Eau, santé et lieux frais sur la carte ». Un refuge contre la chaleur sans un seul lieu frais, je vous laisse juger.

## 2. Vous avez copié Airbnb

Le sujet présente Airbnb comme le problème : un acteur privé qui capte un « marché juteux » avec des règles incontrôlées. Votre `docs/Design.md` commence par « Airbnb is the canonical example of a generous, photography-led consumer marketplace » et décrit, en anglais, la charte graphique d'Airbnb : la couleur « Rausch », la police Cereal, la barre de recherche en pilule. `src/web/src/index.css` reprend la couleur `#ff385c` avec le commentaire « inspiré de docs/Design.md (Airbnb) », et `TypeFilter.jsx` annonce un bandeau de catégories « à la manière d'Airbnb ».

Vous voulez vendre à une mairie un service public qui ressemble à l'entreprise qu'il doit concurrencer. Le jour de la présentation au conseil municipal, la première question sera « c'est Airbnb ? », et le service juridique de la mairie posera la deuxième, sur la propriété de cette charte.

## 3. Ce que j'ai demandé en séance

Météo. J'ai demandé le passé, le présent et le futur, quatre jours avant et quatre jours après. `meteo.py` demande `past_days: 2` et `forecast_days: 7`. Sur l'accueil, le composant est en mode `compact` et n'affiche que la température du moment. La liste des jours n'apparaît que dans le formulaire de réservation, filtrée sur les dates du séjour, donc un visiteur ne voit jamais les jours passés.

Rubriques. Pour les loisirs, vous avez un lac et deux objets « piscine », dont votre propre plan admet qu'ils peuvent décrire « un bassin et son établissement ». Pour la santé, trois pharmacies : pas un médecin, pas un service d'urgence, sur une plateforme destinée à des gens qui fuient une canicule. Les commerces se limitent à l'alimentation, et les transports sont 108 repères sans aucun horaire affiché.

Villes voisines. Rien. Votre emprise est un rectangle autour de la commune, avec un peu plus de 2,6 km de marge.

Français et anglais. Aucune trace d'internationalisation dans `src/web`.

Ville d'origine. `choix-de-la-ville.md` annonçait « la météo de la ville d'origine et de La Clusaz » et « la différence de température prévue pendant la nuit ». Le code ne contient ni l'une ni l'autre.

## 4. Vendre à une mairie, mais laquelle ?

Tout est écrit en dur pour La Clusaz :

- `logement-commun.schema.json` impose `"ville": { "const": "La Clusaz" }` et un code postal `^74220$` ;
- `create-logement.schema.json` exige un identifiant d'adresse qui commence par `74080_` ;
- `meteo.py` fixe `COMMUNE = '74080'` et les coordonnées 45.905, 6.424 ;
- `territoire.py` fixe l'emprise géographique ;
- la migration `007_adresses_reference.sql` pèse 329 Ko et insère les 2 544 adresses de la commune.

Aucune de ces valeurs n'est un paramètre. Pour installer la plateforme à Annecy, il faut modifier deux JSON Schema et plusieurs fichiers Python, puis écrire une nouvelle migration. Il n'existe d'ailleurs aucune table `commune` ou `collectivite` : la mairie est un booléen `est_admin` posé sur un compte utilisateur.

Le modèle économique ne tient pas mieux. Le sujet parle de « prélèvement d'une commission ». Votre README précise qu'« aucun paiement n'est déclenché », et la facture elle-même affiche « Ce document ne constitue pas une preuve de paiement ». La commission reste donc une ligne de texte. La plateforme qui devrait la percevoir n'apparaît pas sur la facture : l'émetteur est l'hôte, le client est le voyageur, et l'opérateur n'existe pas. Enfin, aucune taxe de séjour, alors que c'est une recette de la commune. C'est la première ligne qu'un maire chercherait.

## 5. Les formats du rendu 1

La facture n'a jamais qu'une ligne, `Hébergement — N nuit(s)`. Votre DTD prévoit `ligne+`, votre XSD `maxOccurs="unbounded"`, et aucune facture n'en a jamais eu deux. Pas de frais, pas de taxe : vous avez modélisé une liste pour y mettre un seul élément.

Dans la DTD, `numero` est un attribut `CDATA`. J'ai passé une diapo sur `ID` et `IDREF`, et un numéro de facture est un identifiant par définition. Les `id` de l'émetteur et du client sont aussi en `CDATA`.

Le même document n'obéit pas aux mêmes règles selon son format. En JSON, l'email du client est contrôlé (`"format": "email"`). Dans le XSD, c'est un `texte`, autrement dit une chaîne non vide : « a » est un email valide pour votre facture XML. Votre plan promet la « même facture en JSON, XML, HTML, texte et collection ». Vous avez surtout deux contrats qui ne disent pas la même chose.

Aucun espace de noms dans aucun de vos XML, alors que j'y ai consacré quatre diapos. Le jour où votre facture partira vers le logiciel comptable de la mairie, vos balises `nom`, `adresse` et `ligne` entreront en collision avec les siennes.

## 6. Le logement en XSLT : un détour pour rien

Le sujet dit « Idem avec un fichier de présentation d'un logement (JSon) ». Vous avez donc converti le JSON en XML pour lui appliquer du XSLT. Regardez ce que fait `logement_documents.py`. La fonction `projeter` fabrique un XML où chaque élément de liste s'appelle `item`, sans DTD ni XSD, et ce XML n'est jamais validé. Ensuite, Python formate lui-même le prix (`racine.set('prix', ...)`), traduit l'ombrage et les catégories en libellés, et colle le tout en attributs. `logement.xsl` n'a plus qu'à recopier des valeurs déjà prêtes.

Pour la facture, les euros sont formatés en XSLT avec `format-number`. Pour le logement, c'est Python qui s'en charge. Deux méthodes pour le même problème, dans le même dépôt.

Ma diapo « Pour Json: faut-il utiliser XSLT (ou équivalent)? » explique que, pour du JSON, on transforme en général par programme, parce qu'un modèle de transformation ajoute un système de plus. Vous avez ajouté le système de plus, puis vous avez fait l'essentiel du travail en Python quand même.

## 7. Le RDFa, ou l'annuaire pour robots

`/api/utilisateurs/<id>/profil.html` est publique, sans connexion. La page affiche l'email et le téléphone de chaque hôte, annotés `property="email"` et `property="telephone"`. Les identifiants sont des entiers consécutifs : une boucle de dix lignes récupère tous les hôtes de la plateforme, et le RDFa lui indique en plus où trouver l'email.

Mieux : `verifier_documents.py` contrôle que l'email figure bien dans le RDFa. Vous avez écrit un test qui garantit la fuite.

Sur une plateforme municipale, la mairie est responsable du traitement au sens du RGPD. Expliquez-moi pourquoi le service avait besoin de publier les coordonnées personnelles des habitants. Et ne m'opposez pas l'exemple de mon cours avec l'email de Manu Sporny : c'était un exemple de syntaxe, pas une politique de données.

## 8. Le JSON-LD : des identifiants qui ne mènent à aucune donnée

Les `@id` de vos lieux ont la forme `https://<origine>/carte?lieu=23#lieu`. Si `REFUGE_PUBLIC_ORIGIN` n'est pas défini, l'origine vient de l'hôte de la requête, donc le même lieu change d'identifiant selon l'adresse par laquelle on interroge le serveur. Quand un programme déréférence cette URI, il reçoit l'application React. Elle montre le lieu à un humain et ne renvoie aucune donnée à une machine.

Je vous ai montré DBpedia et Wikidata. Votre graphe ne pointe vers aucun des deux : ni La Clusaz ni le lac des Confins n'y sont reliés. Votre `sameAs` renvoie vers une page OpenStreetMap, et le graphe reste enfermé dans votre site.

Votre document principal, `GET /api/logements/{id}`, n'a d'ailleurs aucun `@context`. Les valeurs y sont des chaînes sans type, exactement le « Tout est string ! » de mon cours.

## 9. Le cœur du rendu 2 n'a jamais tourné pour de vrai

Votre `revue-projet.md` le dit lui-même : « Le parcours ILaaS a été exercé avec réponses simulées et clé absente. La réponse réelle du modèle reste à essayer avec une clé de cours configurée sur le serveur. » Le texte libre transformé en JSON par un LLM est le centre du rendu 2. Vous avez écrit un prompt d'une douzaine de règles, un schéma partiel et trois classes d'erreur pour un appel que la version finale n'a jamais fait avec le vrai modèle.

Si la clé fonctionne le jour de l'oral, tant mieux. Si `mistral-small` renvoie un bloc Markdown mal fermé ou un prix en euros au lieu de centimes, vous le découvrirez devant moi.

## 10. Deux applications dans un seul dépôt

`src/server` et `src/client` contiennent le prototype, avec son `facture.xsd`, sa `facture.dtd`, sa `base_de_donnees.dtd`, ses XSLT, son `populate.py` et son appel ILaaS. `src/api`, `src/web`, `src/db` et `src/formats` contiennent la version finale, avec un autre `facture.xsd`, un autre `populate.py` et un autre appel ILaaS. Le Makefile garde `populate-legacy`, et la section « Organisation » du README décrit l'arborescence du prototype.

Laquelle dois-je noter ? Si c'est la seconde, la première n'a rien à faire dans le rendu : l'historique git suffit pour la conserver.

La version finale traîne aussi ses restes. `UpcomingPage.jsx` n'est importé nulle part, et les gabarits `src/api/documents/logement.html` et `logement.txt` ne servent plus depuis que l'XSLT les a remplacés.

## 11. La documentation

Le README renvoie vers `docs/README.md`, et son arborescence annonce `docs/presentation.pptx` et `docs/choix-de-la-ville.md`. Aucun de ces fichiers n'existe à cet endroit, le troisième étant rangé dans `docs/sujet/`. Le dossier `docs` contient plus de 1 200 lignes de Markdown, auxquelles s'ajoutent les 20 Ko du README, pour un sujet qui tient sur deux pages. Je l'ai lu une fois. Le jour de la soutenance, donnez-moi une page.

## 12. Les tests

Le dépôt ne contient aucun test automatisé : pas de `test_*.py`, rien côté React. Vous avez un script, `verifier_documents.py`, qui tourne sur la base de démo. Il est utile, mais il ne vérifie pas tout ce qu'il annonce. À la fin, il affiche « 101 factures · DTD, XSD, rendus XSLT, collection et références contrôlés ». Lisez la boucle : le contrôle des rendus HTML et texte est placé après la boucle sur les factures, il ne porte donc que sur la dernière des 101.

## 13. L'altitude, la météo et les distances

Vous récupérez l'altitude IGN de chaque logement localisé, puis vous n'en faites rien. La météo vient d'un point unique, le même pour un logement au village et pour un logement près du col des Aravis, plusieurs centaines de mètres plus haut. Et `temperature_2m_min` est un minimum quotidien. Votre note sur le choix de La Clusaz faisait de la température nocturne un critère essentiel, et aucune température de nuit n'apparaît dans l'application.

Vos distances sont à vol d'oiseau. À La Clusaz, une pharmacie à 123 m à vol d'oiseau peut demander bien plus de marche, avec du dénivelé. Pour une personne âgée en pleine canicule, c'est cette distance-là qui compte.

## 14. Détails qui m'agacent

- `reservation.statut` accepte `terminee` et `facture.statut` accepte `brouillon`. Aucune ligne de code n'utilise ces valeurs.
- 2 544 adresses dans une migration de schéma : la structure et les données sont mélangées.
- La facture garde l'identité des parties dans une colonne `contexte_json`. Je comprends l'intention, figer la facture, mais c'est un document JSON rangé dans une base relationnelle. Préparez votre justification.
- Les photos de la fiche XSLT ont toutes le même texte alternatif, « Photo du logement ». L'ancien gabarit Jinja indiquait le titre et le numéro de la photo.
- 134 des 145 commits viennent du même compte, pour un groupe de cinq. À l'oral, chacun répondra sur chaque partie.

## 15. Ce que je vous accorde, du bout des lèvres

- Les schémas sont sérieux : des `$defs` partagés par trois JSON Schema, de vraies contraintes, `additionalProperties: false`.
- La démonstration « date invalide : la DTD accepte, le XSD refuse » illustre mieux mes diapos sur les limites des DTD que mes diapos elles-mêmes.
- `xs:key` et `xs:keyref` dans l'export de la base. Peu de groupes y pensent.
- Montants en centimes entiers, facture figée dans la transaction d'acceptation, une seule facture même avec deux acceptations concurrentes.
- Les sources sont citées, datées et sous licence. Vous écrivez ce que vos données ne permettent pas d'affirmer, et vous n'avez pas inventé de score de fraîcheur.

## 16. Les questions que je poserai

1. Montrez-moi un réfugié climatique dans votre modèle de données. Qu'est-ce qui le distingue d'un touriste ?
2. Combien de fichiers faut-il modifier pour installer la plateforme à Annecy ?
3. Pourquoi l'email des hôtes est-il public, annoté en RDFa, sans authentification ?
4. Pourquoi convertir le JSON du logement en XML, si c'est Python qui formate les valeurs ?
5. Qui perçoit la commission, et comment ? Où est la taxe de séjour ?
6. Lancez un vrai appel à ILaaS. Maintenant.
7. Que reçoit un programme qui déréférence l'URI d'un lieu ?
8. Pourquoi deux jours de météo passée, alors que j'en ai demandé quatre ?
9. Écrivez au tableau l'équivalent JSON Path de l'une de vos requêtes XPath.
10. Vous, au fond : expliquez-moi `xs:keyref` sans regarder l'écran.
