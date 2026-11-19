ALTER TABLE logement ADD COLUMN ombrage TEXT NOT NULL DEFAULT 'non_renseigne'
    CHECK (ombrage IN ('non_renseigne', 'aucun', 'partiel', 'important'));
INSERT OR IGNORE INTO equipement(nom) VALUES ('Aération traversante');

CREATE TABLE localisation_logement (
    logement_id INTEGER PRIMARY KEY REFERENCES logement(id) ON DELETE CASCADE,
    adresse_ign TEXT NOT NULL,
    longitude REAL NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    latitude REAL NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    verifie_le TEXT NOT NULL,
    altitude REAL,
    altitude_le TEXT
);

CREATE TABLE point_interet (
    id INTEGER PRIMARY KEY,
    source TEXT NOT NULL CHECK (source IN ('osm','mairie')),
    identifiant TEXT NOT NULL,
    categorie TEXT NOT NULL CHECK (categorie IN ('eau','pharmacie','transport','lac','piscine','alimentation','lieu_frais')),
    nom TEXT,
    latitude REAL NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude REAL NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    position TEXT NOT NULL CHECK (position IN ('point','centre','entree')),
    acces TEXT NOT NULL CHECK (acces IN ('public','inconnu','restreint')),
    url TEXT NOT NULL,
    collecte_le TEXT NOT NULL,
    verifie_le TEXT,
    actif INTEGER NOT NULL DEFAULT 1 CHECK (actif IN (0,1)),
    auteur_id INTEGER REFERENCES utilisateur(id),
    UNIQUE(source, identifiant)
);
CREATE INDEX lieux_actifs ON point_interet(actif, categorie);
CREATE TABLE import_territoire (
    source TEXT PRIMARY KEY, tentative_le TEXT NOT NULL, succes_le TEXT, resultat TEXT NOT NULL, volume INTEGER
);
CREATE TABLE cache_meteo (
    commune TEXT PRIMARY KEY, recupere_le TEXT NOT NULL, contenu TEXT NOT NULL
);
