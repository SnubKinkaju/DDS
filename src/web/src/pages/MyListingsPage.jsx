import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ExternalLink, Eye, EyeOff, House, Pencil, Plus, Trash2 } from "lucide-react";
import PageLayout from "../components/PageLayout.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { typeIcon, typeLabel } from "../data/listingTypes.js";
import { formatPrice, plural } from "../utils/format.js";
import {
  deleteLogement,
  listMyLogements,
  setLogementStatus,
} from "../services/logementApi.js";

export default function MyListingsPage() {
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    let active = true;
    listMyLogements()
      .then((data) => {
        if (active) setLogements(data.logements);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function action(logement, remove = false) {
    if (
      remove &&
      !window.confirm(
        `Supprimer définitivement « ${logement.titre} » et ses photos ?`,
      )
    )
      return;
    setBusy(logement.id);
    setError(null);
    try {
      if (remove) {
        await deleteLogement(logement.id);
        setLogements((items) =>
          items.filter((item) => item.id !== logement.id),
        );
      } else {
        const response = await setLogementStatus(
          logement.id,
          logement.statut === "publie" ? "indisponible" : "publie",
        );
        setLogements((items) =>
          items.map((item) =>
            item.id === logement.id ? response.logement : item,
          ),
        );
      }
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  }

  const online = logements.filter((item) => item.statut === "publie").length;

  return (
    <PageLayout width="narrow">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold text-ink">Mes logements</h1>
          {!loading && logements.length > 0 && (
            <p className="mt-1 text-base text-muted">
              {plural(logements.length, "annonce")} · {online} en ligne
            </p>
          )}
        </div>
        {logements.length > 0 && (
          <Link to="/publier" className="button-secondary button-small">
            <Plus aria-hidden="true" size={16} />
            Nouvelle annonce
          </Link>
        )}
      </div>

      <ErrorMessage error={error} />

      {loading && (
        <div className="mt-8 animate-pulse space-y-4" role="status" aria-label="Chargement">
          {[0, 1].map((index) => (
            <div key={index} className="flex gap-4">
              <div className="h-24 w-36 rounded-sm bg-surface-strong" />
              <div className="flex-1 space-y-2 pt-2">
                <div className="h-4 w-1/2 rounded bg-surface-strong" />
                <div className="h-4 w-1/3 rounded bg-surface-strong" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && logements.length === 0 && (
        <div className="mt-8">
          <EmptyState
            Icon={House}
            title="Votre premier logement commence ici"
            action={
              <Link to="/publier" className="button-primary">
                Créer une annonce
              </Link>
            }
          >
            Ajoutez une annonce pour la rendre visible dans le catalogue.
          </EmptyState>
        </div>
      )}

      {logements.length > 0 && (
        <ul className="mt-8 divide-y divide-hairline-soft border-y border-hairline-soft">
          {logements.map((logement) => {
            const published = logement.statut === "publie";
            const TypeIcon = typeIcon(logement.typeLogement);
            return (
              <li
                key={logement.id}
                className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-6"
              >
                <Link
                  to={`/mes-logements/${logement.id}/modifier`}
                  className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5"
                >
                  <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-sm bg-surface-strong text-muted-soft sm:h-24 sm:w-36">
                    {logement.photos[0] ? (
                      <img className="size-full object-cover" src={logement.photos[0].url} alt="" />
                    ) : (
                      <TypeIcon aria-hidden="true" size={28} strokeWidth={1.25} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-ink first-letter:uppercase">
                      {logement.titre}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted sm:truncate">
                      {typeLabel(logement.typeLogement)} · {plural(logement.capacite, "voyageur")}{" "}
                      · {formatPrice(logement.prixNuitCentimes)} / nuit
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-ink">
                      <span
                        aria-hidden="true"
                        className={`size-2 rounded-full ${published ? "bg-success" : "bg-muted-soft"}`}
                      />
                      {published ? "En ligne" : "Masqué"}
                    </p>
                  </div>
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/mes-logements/${logement.id}/modifier`}
                    className="button-secondary button-small"
                  >
                    <Pencil aria-hidden="true" size={15} />
                    Modifier
                  </Link>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => action(logement)}
                    className="button-secondary button-small"
                  >
                    {published ? (
                      <EyeOff aria-hidden="true" size={15} />
                    ) : (
                      <Eye aria-hidden="true" size={15} />
                    )}
                    {busy === logement.id ? "En cours…" : published ? "Masquer" : "Publier"}
                  </button>
                  {published && (
                    <Link
                      to={`/logements/${logement.id}`}
                      className="icon-button"
                      aria-label={`Voir l’annonce ${logement.titre}`}
                      title="Voir l’annonce"
                    >
                      <ExternalLink aria-hidden="true" size={17} />
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => action(logement, true)}
                    className="icon-button text-error hover:bg-red-50"
                    aria-label={`Supprimer ${logement.titre}`}
                    title="Supprimer"
                  >
                    <Trash2 aria-hidden="true" size={17} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PageLayout>
  );
}
