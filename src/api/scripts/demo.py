"""Construit une base autonome de démonstration avec des acteurs fictifs."""

import argparse
import json
from contextlib import closing
from datetime import timedelta
from pathlib import Path
from tempfile import TemporaryDirectory

from src.api.scripts.populate import populate, DEMO_PASSWORD
from src.api.services import localisation, photo_service, reservation_service
from src.api.services.import_lieux import importer, EXTRAITS
from src.db.connection import connect
from src.db.migrate import migrate


# Titres et ombrage fictifs, rattachés aux adresses de référence par identifiant BAN.
EXEMPLES = {
    '74080_0255_00164': ('Refuge du village', 'important'),
    '74080_0275_04777': ('Séjour aux Confins', 'partiel'),
    '74080_0380_00009': ('Studio des Aravis', 'non_renseigne'),
    '74080_0255_07153': ('Séjour au col des Aravis', 'aucun'),
    '74080_0275_00172': ('Refuge du Bossonnet', 'partiel'),
    '74080_0260_01775': ('Halte des Laquais', 'important'),
}


def construire(dossier):
    database = dossier / 'refuge.sqlite3'
    populate(100, 20, 1, database)
    with closing(connect(database)) as db:
        points = json.loads((EXTRAITS / 'adresses-ign.json').read_text())
        logements = db.execute('SELECT * FROM logement ORDER BY id DESC').fetchall()
        clients = db.execute("SELECT id FROM utilisateur WHERE role='client' ORDER BY id").fetchall()
        voyageur, mairie = clients[0][0], clients[-1][0]
        with db:
            db.execute(
                "UPDATE utilisateur SET email='personne' || id || '@example.test', telephone=NULL"
            )
            db.execute(
                "UPDATE utilisateur SET nom='Dupont', email='voyageur@example.test' WHERE id=?",
                (voyageur,),
            )
            db.execute(
                "UPDATE utilisateur SET est_admin=1,email='mairie@example.test' WHERE id=?", (mairie,)
            )
            db.execute(
                "UPDATE utilisateur SET email='hote@example.test' WHERE id=?",
                (logements[0]['proprietaire_id'],),
            )
            for i, point in enumerate(points):
                l = logements[i]
                titre, ombrage = EXEMPLES[point['id']]
                db.execute(
                    'UPDATE logement SET titre=?,ombrage=?,description=? WHERE id=?',
                    (
                        titre,
                        ombrage,
                        'Annonce fictive de démonstration, localisée à une adresse de référence de La Clusaz.',
                        l['id'],
                    ),
                )
                db.execute('UPDATE adresse SET rue=? WHERE id=?', (point['rue'], l['adresse_id']))
                localisation.enregistrer(db, l['id'], point)
                if i < 2:
                    db.execute(
                        """INSERT OR IGNORE INTO logement_equipement SELECT ?,id FROM equipement
                                  WHERE nom IN ('Volets','Aération traversante')""",
                        (l['id'],),
                    )
        for l, file in zip(
            logements, ('appartement-clair.jpg', 'chalet-bois.jpg', 'interieur-bois.jpg')
        ):
            image = EXTRAITS.parents[2] / 'web/public/images' / file
            with image.open('rb') as photo:
                photo_service.upload(db, l['id'], l['proprietaire_id'], photo, dossier / 'photos')
        importer(db, EXTRAITS / 'lieux-osm.json')
        for i in range(103):
            l = logements[i % len(logements)]
            debut = reservation_service.today() + timedelta(days=15 + i * 2)
            fin = debut + timedelta(days=2)
            guest = voyageur if i % 3 == 0 else clients[i % len(clients)][0]
            demande = reservation_service.create(
                db,
                guest,
                {
                    'logementId': l['id'],
                    'nombreVoyageurs': 1,
                    'dateDebut': debut.isoformat(),
                    'dateFin': fin.isoformat(),
                },
            )
            if i == 102:
                continue
            statut = 'refusee' if i == 101 else 'acceptee'
            reservation_service.change_status(
                db, demande['id'], l['proprietaire_id'], {'statut': statut}
            )
            if i == 100:
                reservation_service.change_status(db, demande['id'], guest, {'statut': 'annulee'})
        print("Démonstration créée avec 103 séjours et 101 factures.")


def preparer(dossier):
    dossier = dossier.resolve()
    fichier = dossier / 'refuge.sqlite3'
    if dossier.exists():
        if not (dossier / 'demo-refuge').is_file() or not fichier.is_file():
            raise ValueError(
                "Ce dossier contient déjà des données. Choisissez un dossier de démonstration dédié."
            )
        migrate(fichier)
    else:
        dossier.parent.mkdir(parents=True, exist_ok=True)
        with TemporaryDirectory(dir=dossier.parent) as tmp:
            staging = Path(tmp) / 'demo'
            staging.mkdir()
            construire(staging)
            (staging / 'demo-refuge').write_text('1\n')
            staging.rename(dossier)
    print(f"Base de démonstration : {fichier}")
    print(
        f"Comptes : voyageur@example.test, hote@example.test, mairie@example.test · Mot de passe : {DEMO_PASSWORD}"
    )


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dossier', type=Path, default=Path('instance/demo'))
    args = parser.parse_args()
    try:
        preparer(args.dossier)
    except ValueError as exc:
        parser.exit(1, str(exc) + '\n')
