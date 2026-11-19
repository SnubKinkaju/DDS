<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:decimal-format name="fr" decimal-separator="," grouping-separator=" "/>
  <xsl:template name="euros">
    <xsl:param name="centimes"/>
    <xsl:value-of select="format-number($centimes div 100, '# ##0,00', 'fr')"/><xsl:text> €</xsl:text>
  </xsl:template>
  <xsl:template name="date">
    <xsl:param name="valeur"/>
    <xsl:value-of select="concat(substring($valeur, 9, 2), '/', substring($valeur, 6, 2), '/', substring($valeur, 1, 4))"/>
  </xsl:template>
</xsl:stylesheet>
