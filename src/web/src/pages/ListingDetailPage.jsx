import { MapPin, Pencil, SearchX, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import EmptyState from "../components/EmptyState.jsx";
import PageLayout from "../components/PageLayout.jsx";
import PhotoGallery from "../components/listings/PhotoGallery.jsx";
import OwnerProfileDialog from "../components/listings/OwnerProfileDialog.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { amenityIcon, typeLabel } from "../data/listingTypes.js";
import { getLogement } from "../services/logementApi.js";
import { formatPrice, initials, plural } from "../utils/format.js";

function ListingDetailPage() {
  const { logementId } = useParams();
  const { utilisateur } = useAuth();
  const [logement, setLogement] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let active = true;
    setChargement(true);
    setErreur("");
    setLogement(null);

    getLogement(logementId)
      .then((response) => {
        if (active) setLogement(response);
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
  }, [logementId]);

  return (
    <PageLayout width="narrow">
      {chargement && <DetailSkeleton />}

      {erreur && (
        <EmptyState
          Icon={SearchX}
          title="Logement introuvable"
          action={
            <Link className="button-secondary" to="/logements">
              Retour aux logements
            </Link>
          }
        >
          {erreur}
        </EmptyState>
      )}

      {logement && (
        <Listing
          logement={logement}
          isOwner={utilisateur?.id === logement.proprietaire.id}
        />
      )}
    </PageLayout>
  );
}

function Listing({ logement, isOwner }) {
  const { adresse, proprietaire } = logement;
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-[26px] leading-tight font-semibold text-ink first-letter:uppercase">
          {logement.titre}
        </h1>
        {isOwner && (
          <Link
            className="button-secondary button-small"
            to={`/mes-logements/${logement.id}/modifier`}
          >
            <Pencil aria-hidden="true" size={15} />
            Modifier mon annonce
          </Link>
        )}
      </div>

      <PhotoGallery
        key={logement.id}
        photos={logement.photos}
        title={logement.titre}
      />

      <div className="mt-8 grid gap-12 md:mt-12 lg:grid-cols-[1fr_360px] lg:gap-20">
        <div className="min-w-0">
          <section className="pb-8">
            <h2 className="text-[22px] font-semibold text-ink">
              {typeLabel(logement.typeLogement)} · {adresse.ville}
            </h2>
            <p className="mt-1 text-base text-body">
              Jusqu’à {plural(logement.capacite, "voyageur")}
            </p>
          </section>

          <a
            href={`/api/utilisateurs/${proprietaire.id}/profil.html`}
            aria-haspopup="dialog"
            onClick={(event) => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              setProfileOpen(true);
            }}
            className="group flex items-center gap-4 border-y border-hairline-soft py-6 transition-colors hover:bg-surface-soft"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white">
              {initials(proprietaire)}
            </span>
            <div>
              <p className="text-base font-semibold text-ink group-hover:underline">
                Proposé par {proprietaire.prenom} {proprietaire.nom}
              </p>
              <p className="text-sm text-muted">Voir le profil</p>
            </div>
          </a>

          {profileOpen && (
            <OwnerProfileDialog proprietaire={proprietaire} onClose={() => setProfileOpen(false)} />
          )}

          <section className="border-b border-hairline-soft py-8">
            <h2 className="sr-only">Description</h2>
            <p className="text-base leading-6 whitespace-pre-line text-body">
              {logement.description}
            </p>
          </section>

          <section className="border-b border-hairline-soft py-8">
            <h2 className="text-[22px] font-semibold text-ink">
              Ce que propose ce logement
            </h2>
            {logement.equipements.length ? (
              <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {logement.equipements.map((item) => {
                  const Icon = amenityIcon(item.nom);
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-4 text-base text-ink"
                    >
                      <Icon aria-hidden="true" size={24} strokeWidth={1.5} />
                      {item.nom}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-base text-muted">
                Aucun équipement renseigné.
              </p>
            )}
          </section>

          <section className="py-8">
            <h2 className="text-[22px] font-semibold text-ink">Emplacement</h2>
            <p className="mt-4 flex items-center gap-3 text-base text-body">
              <MapPin aria-hidden="true" size={20} className="shrink-0" />
              {adresse.rue}, {adresse.codePostal} {adresse.ville}
            </p>
            <Link to="/carte" className="button-tertiary mt-4">
              Voir la carte de La Clusaz
            </Link>
          </section>

          <details className="border-t border-hairline-soft py-6">
            <summary className="cursor-pointer text-base font-semibold text-ink">
              Documents du logement
            </summary>
            <nav
              aria-label="Documents du logement"
              className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm"
            >
              <a
                className="button-tertiary"
                href={`/api/logements/${logement.id}`}
                target="_blank"
                rel="noreferrer"
              >
                Données JSON
              </a>
              <a
                className="button-tertiary"
                href={`/api/logements/${logement.id}/fiche.html`}
                target="_blank"
                rel="noreferrer"
              >
                Fiche HTML / impression
              </a>
              <a
                className="button-tertiary"
                href={`/api/logements/${logement.id}/fiche.txt?telecharger=1`}
              >
                Télécharger le texte
              </a>
              <a
                className="button-tertiary"
                href="/api/formats/json/logement.schema.json"
                target="_blank"
                rel="noreferrer"
              >
                JSON Schema
              </a>
            </nav>
          </details>
        </div>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-md border border-hairline p-6 shadow-floating">
            <p className="text-ink">
              <span className="text-[22px] font-semibold">
                {formatPrice(logement.prixNuitCentimes)}
              </span>{" "}
              <span className="text-base">par nuit</span>
            </p>
            <dl className="mt-6 divide-y divide-border-strong rounded-sm border border-border-strong text-sm">
              <div className="px-4 py-3">
                <dt className="text-[10px] font-bold tracking-wide text-ink uppercase">Ville</dt>
                <dd className="mt-0.5 text-body">{adresse.ville}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <dt className="text-[10px] font-bold tracking-wide text-ink uppercase">
                    Voyageurs
                  </dt>
                  <dd className="mt-0.5 text-body">{plural(logement.capacite, "voyageur")} max.</dd>
                </div>
                <UsersRound aria-hidden="true" size={18} className="text-muted" />
              </div>
            </dl>
            <button type="button" className="button-primary mt-4 w-full" disabled>
              Réserver
            </button>
            <p className="mt-3 text-center text-sm text-muted">
              La réservation en ligne arrive bientôt.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div
      className="animate-pulse"
      role="status"
      aria-label="Chargement du logement"
    >
      <div className="h-8 w-2/3 rounded bg-surface-strong" />
      <div className="mt-6 h-72 rounded-lg bg-surface-strong md:h-[420px]" />
      <div className="mt-10 h-6 w-1/3 rounded bg-surface-strong" />
      <div className="mt-3 h-4 w-1/4 rounded bg-surface-strong" />
    </div>
  );
}

export default ListingDetailPage;
