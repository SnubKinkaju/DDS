import { useEffect, useState } from "react";
import { CircleCheck, ChevronLeft, ExternalLink } from "lucide-react";
import { Link, useLocation, useParams } from "react-router";

import ErrorMessage from "../components/ErrorMessage.jsx";
import PageLayout from "../components/PageLayout.jsx";
import ListingForm from "../components/listings/ListingForm.jsx";
import PhotoManager from "../components/listings/PhotoManager.jsx";
import { getOwnedLogement, updateLogement } from "../services/logementApi.js";

export default function EditListingPage() {
  const { logementId } = useParams();
  const { state } = useLocation();
  const [logement, setLogement] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(
    state?.created ? "Votre logement est publié. Ajoutez maintenant vos photos." : "",
  );

  useEffect(() => {
    let active = true;
    setLogement(null);
    setError(null);
    getOwnedLogement(logementId)
      .then((data) => {
        if (active) setLogement(data);
      })
      .catch((err) => {
        if (active) setError(err);
      });
    return () => {
      active = false;
    };
  }, [logementId]);

  async function save(data) {
    setMessage("");
    const response = await updateLogement(logementId, data);
    setLogement(response.logement);
    setMessage("Les modifications sont enregistrées.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <PageLayout width="narrow">
      <header className="mb-8 border-b border-hairline-soft pb-8">
        <Link
          to="/mes-logements"
          className="-ml-2 inline-flex items-center gap-1 rounded-full py-1 pr-3 pl-1 text-sm font-semibold text-ink hover:bg-surface-soft"
        >
          <ChevronLeft aria-hidden="true" size={18} />
          Mes logements
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[32px] font-semibold text-ink">Modifier l’annonce</h1>
            {logement && (
              <p className="mt-1 truncate text-base text-muted first-letter:uppercase">
                {logement.titre}
              </p>
            )}
          </div>
          {logement?.statut === "publie" && (
            <Link className="button-secondary button-small" to={`/logements/${logementId}`}>
              <ExternalLink aria-hidden="true" size={15} />
              Voir l’annonce
            </Link>
          )}
        </div>
        {message && (
          <p
            role="status"
            className="mt-6 flex items-center gap-3 rounded-sm bg-surface-soft p-4 text-sm font-medium text-ink"
          >
            <CircleCheck aria-hidden="true" size={20} className="shrink-0 text-success" />
            {message}
          </p>
        )}
      </header>

      <ErrorMessage error={error} />
      {!logement && !error && (
        <div className="animate-pulse space-y-4" role="status" aria-label="Chargement">
          <div className="h-6 w-40 rounded bg-surface-strong" />
          <div className="h-48 rounded-sm bg-surface-strong" />
        </div>
      )}
      {logement && (
        <>
          <div className="border-b border-hairline-soft">
            <PhotoManager logement={logement} onChange={setLogement} />
          </div>
          <div className="pt-10">
            <ListingForm key={logement.id} logement={logement} onSave={save} />
          </div>
        </>
      )}
    </PageLayout>
  );
}
