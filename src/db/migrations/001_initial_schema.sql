CREATE TABLE adresse (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rue TEXT NOT NULL,
    code_postal TEXT NOT NULL,
    ville TEXT NOT NULL
);

CREATE TABLE utilisateur (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    adresse_id INTEGER,
    prenom TEXT NOT NULL,
    nom TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mot_de_passe_hash TEXT NOT NULL,
    telephone TEXT,
    role TEXT NOT NULL DEFAULT 'client'
        CHECK (role IN ('client', 'proprietaire')),
    date_creation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adresse_id) REFERENCES adresse(id)
);

CREATE TABLE logement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proprietaire_id INTEGER NOT NULL,
    adresse_id INTEGER NOT NULL,
    titre TEXT NOT NULL,
    description TEXT NOT NULL,
    type_logement TEXT NOT NULL,
    capacite INTEGER NOT NULL CHECK (capacite > 0),
    prix_nuit_centimes INTEGER NOT NULL CHECK (prix_nuit_centimes >= 0),
    statut TEXT NOT NULL DEFAULT 'brouillon'
        CHECK (statut IN ('brouillon', 'publie', 'indisponible')),
    date_creation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proprietaire_id) REFERENCES utilisateur(id),
    FOREIGN KEY (adresse_id) REFERENCES adresse(id)
);

CREATE TABLE photo_logement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logement_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
    FOREIGN KEY (logement_id) REFERENCES logement(id) ON DELETE CASCADE,
    UNIQUE (logement_id, position)
);

CREATE TABLE equipement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL UNIQUE
);

CREATE TABLE logement_equipement (
    logement_id INTEGER NOT NULL,
    equipement_id INTEGER NOT NULL,
    PRIMARY KEY (logement_id, equipement_id),
    FOREIGN KEY (logement_id) REFERENCES logement(id) ON DELETE CASCADE,
    FOREIGN KEY (equipement_id) REFERENCES equipement(id) ON DELETE CASCADE
);

CREATE TABLE disponibilite (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logement_id INTEGER NOT NULL,
    date_debut TEXT NOT NULL,
    date_fin TEXT NOT NULL,
    FOREIGN KEY (logement_id) REFERENCES logement(id) ON DELETE CASCADE,
    CHECK (date_fin > date_debut)
);

CREATE TABLE favori (
    utilisateur_id INTEGER NOT NULL,
    logement_id INTEGER NOT NULL,
    date_creation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (utilisateur_id, logement_id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (logement_id) REFERENCES logement(id) ON DELETE CASCADE
);

CREATE TABLE reservation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logement_id INTEGER NOT NULL,
    demandeur_id INTEGER NOT NULL,
    date_debut TEXT NOT NULL,
    date_fin TEXT NOT NULL,
    nombre_voyageurs INTEGER NOT NULL CHECK (nombre_voyageurs > 0),
    prix_nuit_centimes INTEGER NOT NULL CHECK (prix_nuit_centimes >= 0),
    montant_total_centimes INTEGER NOT NULL CHECK (montant_total_centimes >= 0),
    statut TEXT NOT NULL DEFAULT 'en_attente'
        CHECK (
            statut IN (
                'en_attente',
                'acceptee',
                'refusee',
                'annulee',
                'terminee'
            )
        ),
    date_creation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (logement_id) REFERENCES logement(id),
    FOREIGN KEY (demandeur_id) REFERENCES utilisateur(id),
    CHECK (date_fin > date_debut)
);

CREATE TABLE facture (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER NOT NULL UNIQUE,
    numero TEXT NOT NULL UNIQUE,
    date_emission TEXT NOT NULL,
    total_centimes INTEGER NOT NULL CHECK (total_centimes >= 0),
    devise TEXT NOT NULL DEFAULT 'EUR',
    statut TEXT NOT NULL DEFAULT 'emise'
        CHECK (statut IN ('brouillon', 'emise', 'annulee')),
    FOREIGN KEY (reservation_id) REFERENCES reservation(id)
);

CREATE TABLE ligne_facture (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facture_id INTEGER NOT NULL,
    libelle TEXT NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 1 CHECK (quantite > 0),
    prix_unitaire_centimes INTEGER NOT NULL
        CHECK (prix_unitaire_centimes >= 0),
    montant_centimes INTEGER NOT NULL CHECK (montant_centimes >= 0),
    FOREIGN KEY (facture_id) REFERENCES facture(id) ON DELETE CASCADE
);

CREATE INDEX idx_logement_proprietaire
    ON logement(proprietaire_id);

CREATE INDEX idx_logement_statut
    ON logement(statut);

CREATE INDEX idx_disponibilite_logement_dates
    ON disponibilite(logement_id, date_debut, date_fin);

CREATE INDEX idx_reservation_logement
    ON reservation(logement_id);

CREATE INDEX idx_reservation_demandeur
    ON reservation(demandeur_id);

CREATE INDEX idx_reservation_statut
    ON reservation(statut);
