CREATE UNIQUE INDEX idx_utilisateur_email_normalise
    ON utilisateur(LOWER(email));
