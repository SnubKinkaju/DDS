<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text" encoding="UTF-8"/>
  <xsl:template match="/fiche">REFUGE CLIMATIQUE · FICHE N° <xsl:value-of select="logement/id"/>
<xsl:text>&#10;</xsl:text><xsl:value-of select="logement/titre"/>
Type · <xsl:value-of select="logement/typeLogement"/>
Capacité · <xsl:value-of select="logement/capacite"/>
Prix par nuit · <xsl:value-of select="@prix"/>
Adresse · <xsl:value-of select="logement/adresse/rue"/>, <xsl:value-of select="logement/adresse/codePostal"/><xsl:text> </xsl:text><xsl:value-of select="logement/adresse/ville"/>
Description · <xsl:value-of select="logement/description"/>
Ombrage extérieur déclaré · <xsl:value-of select="@ombre"/>
<xsl:if test="environnement/localisation/altitudeMetres">Altitude du terrain · <xsl:value-of select="environnement/localisation/altitudeMetres"/> m (IGN)
</xsl:if>
Équipements déclarés
<xsl:for-each select="logement/equipements/item">- <xsl:value-of select="nom"/><xsl:text>&#10;</xsl:text></xsl:for-each>
À proximité (distances à vol d’oiseau)
<xsl:for-each select="environnement/lieux/item">- <xsl:value-of select="nom"/> · <xsl:value-of select="@libelle"/> · <xsl:value-of select="distanceMetres"/> m · <xsl:value-of select="sourceUrl"/><xsl:text>&#10;</xsl:text></xsl:for-each>
<xsl:if test="not(environnement/lieux/item)"><xsl:choose><xsl:when test="not(environnement/localisation)">Adresse à localiser.</xsl:when><xsl:when test="not(environnement/importLe)">Catalogue en attente de collecte.</xsl:when><xsl:otherwise>Aucun lieu recensé dans un rayon de 2 km.</xsl:otherwise></xsl:choose></xsl:if>
Proposé par <xsl:value-of select="logement/proprietaire/prenom"/><xsl:text> </xsl:text><xsl:value-of select="logement/proprietaire/nom"/><xsl:text>&#10;</xsl:text>
  </xsl:template>
</xsl:stylesheet>
