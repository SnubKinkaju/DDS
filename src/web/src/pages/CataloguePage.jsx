import { useEffect, useState } from "react";

import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import ListingCard from "../components/ListingCard.jsx";
import { listLogements } from "../services/logementApi.js";

function toListing(logement) {
  return {
    id: logement.id,
    title: logement.titre,
    location: `${logement.adresse.codePostal} ${logement.adresse.ville}`,
    details: `${logement.capacite} voyageur${logement.capacite > 1 ? "s" : ""} · ${logement.typeLogement}`,
    price: logement.prixNuitCentimes / 100,
    image: logement.photoPrincipale || "/images/refuge-hero.jpg",
    imageAlt: logement.titre,
    badge: logement.typeLogement,
  };
}

function CataloguePage() {
  const [logements, setLogements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let active = true;

    listLogements()
      .then((response) => {
        if (active) setLogements(response.logements.map(toListing));
      })
      .catch((error) => {
        if (active) setErreur(error.message);
      })
      .finally(() => {
        if (active) setChargement(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto min-h-[calc(100vh-280px)] w-full max-w-[1920px] px-5 py-12 sm:px-8 sm:py-16 xl:px-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">La Clusaz</p>
            <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.035em] text-ink">
              Catalogue des logements
            </h1>
            <p className="mt-3 text-base text-muted">
              Consultez les logements actuellement publiés dans la ville.
            </p>
          </div>
          {!chargement && !erreur && (
            <p className="text-sm text-muted">
              {logements.length} logement{logements.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {chargement && (
          <p className="mt-12 text-sm text-muted">Chargement des logements…</p>
        )}

        {erreur && (
          <div className="mt-10 rounded-card border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            {erreur}
          </div>
        )}

        {!chargement && !erreur && logements.length === 0 && (
          <div className="mt-10 rounded-card border border-hairline bg-surface-soft px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-ink">Aucun logement publié</h2>
            <p className="mt-2 text-sm text-muted">
              Les premiers logements apparaîtront ici dès leur publication.
            </p>
          </div>
        )}

        {logements.length > 0 && (
          <div className="mt-10 grid gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {logements.map((logement) => (
              <ListingCard key={logement.id} listing={logement} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default CataloguePage;
