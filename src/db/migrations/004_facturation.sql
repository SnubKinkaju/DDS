-- Les identités et le séjour sont figés lors de l'émission, dans un document JSON.
ALTER TABLE facture ADD COLUMN contexte_json TEXT NOT NULL DEFAULT '{}'
    CHECK (json_valid(contexte_json));
ALTER TABLE facture ADD COLUMN taux_commission INTEGER NOT NULL DEFAULT 5
    CHECK (taux_commission BETWEEN 0 AND 100);
ALTER TABLE facture ADD COLUMN commission_centimes INTEGER NOT NULL DEFAULT 0
    CHECK (commission_centimes >= 0 AND commission_centimes <= total_centimes);

-- Compteur annuel indépendant du nombre de factures et jamais décrémenté.
CREATE TABLE compteur_facture (
    annee INTEGER PRIMARY KEY,
    dernier_numero INTEGER NOT NULL CHECK (dernier_numero > 0)
);
