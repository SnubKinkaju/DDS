<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" doctype-system="about:legacy-compat"/>
  <xsl:param name="graphe"/><xsl:param name="css"/>
  <xsl:template match="/fiche">
    <html lang="fr"><head>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title><xsl:value-of select="logement/titre"/> · Refuge climatique</title>
      <style><xsl:value-of select="$css"/></style>
      <script type="application/ld+json"><xsl:value-of select="$graphe"/></script>
      <link rel="alternate" type="application/json" href="/api/logements/{logement/id}"/>
      <link rel="alternate" type="text/plain" href="fiche.txt"/>
    </head><body>
      <nav class="document-actions"><a href="/logements/{logement/id}">Retour à l’annonce</a>
        <a href="/api/logements/{logement/id}">JSON</a><a href="fiche.txt">Version texte</a>
        <button type="button" onclick="window.print()">Imprimer la fiche</button>
      </nav>
      <main>
        <header><p class="eyebrow">Refuge climatique · La Clusaz</p><h1><xsl:value-of select="logement/titre"/></h1>
          <p>Fiche n° <xsl:value-of select="logement/id"/> · <xsl:value-of select="logement/typeLogement"/></p></header>
        <section class="summary"><strong><xsl:value-of select="@prix"/> par nuit</strong><p>Capacité · <xsl:value-of select="logement/capacite"/></p></section>
        <section class="photos"><xsl:for-each select="logement/photos/item"><img src="{url}" alt="Photo du logement"/></xsl:for-each></section>
        <p class="description"><xsl:value-of select="logement/description"/></p>
        <h2>Adresse</h2><p><xsl:value-of select="logement/adresse/rue"/>, <xsl:value-of select="logement/adresse/codePostal"/><xsl:text> </xsl:text><xsl:value-of select="logement/adresse/ville"/></p>
        <h2>Protection contre la chaleur</h2><p>Ombrage extérieur déclaré · <xsl:value-of select="@ombre"/></p>
        <xsl:if test="environnement/localisation/altitudeMetres"><p>Altitude du terrain · <xsl:value-of select="environnement/localisation/altitudeMetres"/> m (IGN)</p></xsl:if>
        <h2>Équipements déclarés</h2>
        <xsl:choose><xsl:when test="logement/equipements/item"><ul><xsl:for-each select="logement/equipements/item"><li><xsl:value-of select="nom"/></li></xsl:for-each></ul></xsl:when><xsl:otherwise><p>Aucun équipement renseigné.</p></xsl:otherwise></xsl:choose>
        <h2 id="alentours">À proximité</h2>
        <xsl:choose><xsl:when test="environnement/lieux/item"><ul><xsl:apply-templates select="environnement/lieux/item"/></ul></xsl:when>
          <xsl:when test="not(environnement/localisation)">Adresse à localiser.</xsl:when>
          <xsl:when test="not(environnement/importLe)">Catalogue territorial en attente de collecte.</xsl:when>
          <xsl:otherwise>Aucun lieu recensé dans un rayon de 2 km.</xsl:otherwise></xsl:choose>
        <h2>Proposé par</h2><a href="/api/utilisateurs/{logement/proprietaire/id}/profil.html"><xsl:value-of select="logement/proprietaire/prenom"/><xsl:text> </xsl:text><xsl:value-of select="logement/proprietaire/nom"/></a>
      </main></body></html>
  </xsl:template>
  <xsl:template match="lieux/item"><li>
    <a href="/carte?lieu={id}"><xsl:value-of select="nom"/></a> · <xsl:value-of select="@libelle"/> ·
    <xsl:value-of select="distanceMetres"/> m à vol d’oiseau · <a href="{sourceUrl}"><xsl:value-of select="source"/></a>
    <xsl:if test="position='centre'"> (point représentatif)</xsl:if>
  </li></xsl:template>
</xsl:stylesheet>
