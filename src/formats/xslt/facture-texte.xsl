<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:include href="facture-commun.xsl"/>
  <xsl:output method="text" encoding="UTF-8"/>
  <xsl:template match="/facture">
    <xsl:text>REFUGE CLIMATIQUE — FACTURE DE SÉJOUR&#10;</xsl:text>
    <xsl:value-of select="@numero"/>
    <xsl:text>&#10;Date d’émission : </xsl:text><xsl:call-template name="date"><xsl:with-param name="valeur" select="@dateEmission"/></xsl:call-template>
    <xsl:text>&#10;Statut : </xsl:text><xsl:choose><xsl:when test="@statut='annulee'">Annulée — séjour annulé, facture conservée pour référence.</xsl:when><xsl:otherwise>Émise</xsl:otherwise></xsl:choose>
    <xsl:text>&#10;&#10;ÉMETTEUR · HÉBERGEUR&#10;</xsl:text><xsl:apply-templates select="emetteur"/>
    <xsl:text>&#10;CLIENT · VOYAGEUR&#10;</xsl:text><xsl:apply-templates select="client"/>
    <xsl:text>&#10;SÉJOUR&#10;</xsl:text><xsl:value-of select="logement/titre"/><xsl:text>&#10;</xsl:text><xsl:apply-templates select="logement/adresse"/>
    <xsl:text>Du </xsl:text><xsl:call-template name="date"><xsl:with-param name="valeur" select="sejour/dateDebut"/></xsl:call-template>
    <xsl:text> au </xsl:text><xsl:call-template name="date"><xsl:with-param name="valeur" select="sejour/dateFin"/></xsl:call-template>
    <xsl:text>&#10;</xsl:text><xsl:value-of select="sejour/nombreNuits"/><xsl:text> nuit(s) · </xsl:text><xsl:value-of select="sejour/nombreVoyageurs"/><xsl:text> voyageur(s)</xsl:text>
    <xsl:text>&#10;Réservation n° </xsl:text><xsl:value-of select="sejour/@reservationId"/><xsl:text> · Logement n° </xsl:text><xsl:value-of select="logement/@id"/>
    <xsl:text>&#10;&#10;DÉTAIL DES MONTANTS&#10;</xsl:text>
    <xsl:for-each select="lignes/ligne">
      <xsl:value-of select="libelle"/><xsl:text> : </xsl:text><xsl:value-of select="quantite"/><xsl:text> × </xsl:text>
      <xsl:call-template name="euros"><xsl:with-param name="centimes" select="prixUnitaireCentimes"/></xsl:call-template><xsl:text> = </xsl:text>
      <xsl:call-template name="euros"><xsl:with-param name="centimes" select="montantCentimes"/></xsl:call-template><xsl:text>&#10;</xsl:text>
    </xsl:for-each>
    <xsl:text>&#10;TOTAL DU SÉJOUR : </xsl:text><xsl:call-template name="euros"><xsl:with-param name="centimes" select="totalCentimes"/></xsl:call-template>
    <xsl:text>&#10;Commission incluse (</xsl:text><xsl:value-of select="commission/tauxPourcent"/><xsl:text> %) : </xsl:text><xsl:call-template name="euros"><xsl:with-param name="centimes" select="commission/montantCentimes"/></xsl:call-template>
    <xsl:text>&#10;Part nette de l’hébergeur : </xsl:text><xsl:call-template name="euros"><xsl:with-param name="centimes" select="netEmetteurCentimes"/></xsl:call-template>
    <xsl:text>&#10;La commission est prélevée sur la part de l’hébergeur. Aucun supplément pour le voyageur.&#10;&#10;Montants en EUR. Ce document ne constitue pas une preuve de paiement.&#10;</xsl:text>
  </xsl:template>
  <xsl:template match="emetteur|client">
    <xsl:value-of select="prenom"/><xsl:text> </xsl:text><xsl:value-of select="nom"/><xsl:text>&#10;</xsl:text>
    <xsl:value-of select="email"/><xsl:text>&#10;</xsl:text>
    <xsl:if test="string(telephone)"><xsl:value-of select="telephone"/><xsl:text>&#10;</xsl:text></xsl:if>
    <xsl:apply-templates select="adresse"/>
  </xsl:template>
  <xsl:template match="adresse">
    <xsl:value-of select="rue"/><xsl:text>&#10;</xsl:text><xsl:value-of select="codePostal"/><xsl:text> </xsl:text><xsl:value-of select="ville"/><xsl:text>&#10;</xsl:text>
  </xsl:template>
</xsl:stylesheet>
