ALTER TABLE utilisateur ADD COLUMN est_admin INTEGER NOT NULL DEFAULT 0 CHECK (est_admin IN (0, 1));
ALTER TABLE logement ADD COLUMN motif_suspension TEXT CHECK (length(trim(motif_suspension)) BETWEEN 1 AND 500);
ALTER TABLE logement ADD COLUMN suspendu_le TEXT;

CREATE VIEW logement_public AS
SELECT * FROM logement WHERE statut = 'publie' AND motif_suspension IS NULL;
