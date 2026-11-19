5. Export global + XPath	Exporter toutes les factures dans un XML et démontrer des recherches.
6. Texte libre + LLM	Transformer une description de logement en JSON validé pour préremplir le formulaire.
7. Dimension climatique	Ajouter les informations utiles : altitude, ombrage, équipements contre la chaleur, météo et services proches.


Oui, l’export Xpath de toutes les factures a surtout sa place dans un espace d’administration. Un utilisateur doit uniquement accéder aux factures de ses propres séjours.

On peut donc le garder pour l’arrivée du rôle administrateur de la mairie, avec :
- un export XML de toutes les factures ;
- quelques recherches XPath pour la démonstration : par client, période, montant ou logement ;
- un accès réservé à ce rôle, puisque les factures contiennent des coordonnées personnelles.
On reporte cette fonctionnalité, mais elle reste à réaliser pour le devoir. XPath servira à interroger le document XML exporté ; les recherches habituelles de l’application pourront continuer à utiliser SQL.