<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:include href="facture-commun.xsl"/>
  <xsl:output method="html" encoding="UTF-8" doctype-system="about:legacy-compat"/>
  <xsl:param name="styles"/>
  <xsl:template match="/facture">
    <html lang="fr">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Facture <xsl:value-of select="@numero"/></title>
        <style><xsl:value-of select="$styles"/></style>
      </head>
      <body>
        <main class="facture">
          <header class="entete">
            <div><p class="marque">refuge<span> · climatique</span></p><h1>Facture de séjour</h1><p class="numero"><xsl:value-of select="@numero"/></p></div>
            <div class="emission">
              <p class="etiquette">Date d’émission</p>
              <p><xsl:call-template name="date"><xsl:with-param name="valeur" select="@dateEmission"/></xsl:call-template></p>
              <xsl:choose><xsl:when test="@statut='annulee'"><span class="statut annulee">Annulée</span></xsl:when><xsl:otherwise><span class="statut">Émise</span></xsl:otherwise></xsl:choose>
            </div>
          </header>
          <xsl:if test="@statut='annulee'"><p class="avertissement">Le séjour a été annulé. Cette facture est conservée pour référence.</p></xsl:if>
          <section class="parties" aria-label="Les deux parties">
            <div><h2>Émetteur · Hébergeur</h2><xsl:apply-templates select="emetteur"/></div>
            <div><h2>Client · Voyageur</h2><xsl:apply-templates select="client"/></div>
          </section>
          <section class="sejour">
            <h2>Votre séjour</h2>
            <h3><xsl:value-of select="logement/titre"/></h3>
            <xsl:apply-templates select="logement/adresse"/>
            <div class="dates">
              <div><span class="etiquette">Arrivée</span><strong><xsl:call-template name="date"><xsl:with-param name="valeur" select="sejour/dateDebut"/></xsl:call-template></strong></div>
              <div><span class="etiquette">Départ</span><strong><xsl:call-template name="date"><xsl:with-param name="valeur" select="sejour/dateFin"/></xsl:call-template></strong></div>
              <div><span class="etiquette">Séjour</span><strong><xsl:value-of select="sejour/nombreNuits"/> nuit(s) · <xsl:value-of select="sejour/nombreVoyageurs"/> voyageur(s)</strong></div>
            </div>
            <p class="reference">Réservation n° <xsl:value-of select="sejour/@reservationId"/> · Logement n° <xsl:value-of select="logement/@id"/></p>
          </section>
          <section class="montants">
            <h2>Détail des montants</h2>
            <table>
              <thead><tr><th scope="col">Libellé</th><th scope="col">Qté</th><th scope="col">Prix unitaire</th><th scope="col">Montant</th></tr></thead>
              <tbody><xsl:for-each select="lignes/ligne"><tr>
                <td><xsl:value-of select="libelle"/></td><td><xsl:value-of select="quantite"/></td>
                <td><xsl:call-template name="euros"><xsl:with-param name="centimes" select="prixUnitaireCentimes"/></xsl:call-template></td>
                <td><xsl:call-template name="euros"><xsl:with-param name="centimes" select="montantCentimes"/></xsl:call-template></td>
              </tr></xsl:for-each></tbody>
            </table>
            <div class="total"><span>Total du séjour</span><strong><xsl:call-template name="euros"><xsl:with-param name="centimes" select="totalCentimes"/></xsl:call-template></strong></div>
            <div class="commission">
              <p><span>Commission incluse (<xsl:value-of select="commission/tauxPourcent"/> %)</span><strong><xsl:call-template name="euros"><xsl:with-param name="centimes" select="commission/montantCentimes"/></xsl:call-template></strong></p>
              <p><span>Part nette de l’hébergeur</span><strong><xsl:call-template name="euros"><xsl:with-param name="centimes" select="netEmetteurCentimes"/></xsl:call-template></strong></p>
              <small>La commission est prélevée sur la part de l’hébergeur. Aucun supplément pour le voyageur.</small>
            </div>
          </section>
          <footer>Montants en EUR · Ce document ne constitue pas une preuve de paiement.</footer>
        </main>
      </body>
    </html>
  </xsl:template>
  <xsl:template match="emetteur|client">
    <h3><xsl:value-of select="prenom"/><xsl:text> </xsl:text><xsl:value-of select="nom"/></h3>
    <p><xsl:value-of select="email"/></p>
    <xsl:if test="string(telephone)"><p><xsl:value-of select="telephone"/></p></xsl:if>
    <xsl:apply-templates select="adresse"/>
  </xsl:template>
  <xsl:template match="adresse">
    <p><xsl:value-of select="rue"/><br/><xsl:value-of select="codePostal"/><xsl:text> </xsl:text><xsl:value-of select="ville"/></p>
  </xsl:template>
</xsl:stylesheet>
