import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ChevronRight, Layers, Search, X } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import PageLayout from "../components/PageLayout.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import useResource from "../hooks/useResource.js";
import IconeLieu, { GlypheLieu } from "../components/territoire/IconeLieu.jsx";
import {
  categories,
  categoriesSingulier,
  couleurs,
} from "../data/territoire.js";

const CarteLieux = lazy(
  () => import("../components/territoire/CarteLieux.jsx"),
);
const typeLieu = ({ properties }) => properties.categorie || properties.famille;
const normaliser = (texte) =>
  texte.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("fr").trim();

function FicheRepere({ point, fermer }) {
  const { nom, famille, acces, url, sourceUrl } = point.properties;
  const type = typeLieu(point);
  return (
    <section
      id={famille === "lieu" ? "lieu" : "logement"}
      className="carte-selection"
      aria-label="Emplacement sélectionné"
    >
      <IconeLieu categorie={type} />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">
          {categoriesSingulier[type]}
          {acces &&
            (acces === "public" ? " · Accès public" : " · Accès à vérifier")}
        </p>
        <h2 className="mt-0.5 font-semibold leading-tight">{nom}</h2>
        {famille === "logement" ? (
          <Link className="button-tertiary mt-2" to={url}>
            Voir le logement <ChevronRight size={15} />
          </Link>
        ) : (
          <a className="button-tertiary mt-2" href={sourceUrl}>
            Consulter la source <ArrowUpRight size={15} />
          </a>
        )}
      </div>
      <button
        type="button"
        className="icon-button shrink-0"
        onClick={fermer}
        aria-label="Fermer la fiche du repère"
      >
        <X size={17} />
      </button>
    </section>
  );
}

export default function MapPage() {
  const cadre = useRef(null);
  const liste = useRef(null);
  const [revision, setRevision] = useState(0);
  const { data, error } = useResource(
    "/api/territoire/carte.geojson",
    revision,
  );
  const [params, setParams] = useSearchParams();
  const [recherche, setRecherche] = useState("");
  const filtre = params.get("categorie") || "";
  const famille = ["lieu", "logement"].find((key) => params.has(key));
  const selection = famille && famille + "-" + params.get(famille);
  const points = useMemo(() => {
    const terme = normaliser(recherche);
    return (data?.features || []).filter(
      (point) =>
        (!filtre || typeLieu(point) === filtre) &&
        normaliser(point.properties.nom).includes(terme),
    );
  }, [data, filtre, recherche]);
  const choisi = points.find((point) => point.id === selection);

  function choisirSurCarte(point) {
    choisir(point);
    const bouton = liste.current?.querySelector(`[data-point="${point.id}"]`);
    if (bouton && liste.current.clientHeight > 0) {
      const conteneur = liste.current.getBoundingClientRect();
      const rect = bouton.getBoundingClientRect();
      if (rect.top < conteneur.top || rect.bottom > conteneur.bottom) {
        liste.current.scrollTop += rect.top - conteneur.top;
      }
    }
  }

  function choisir(point) {
    const next = new URLSearchParams(params);
    next.delete("lieu");
    next.delete("logement");
    if (point) next.set(point.properties.famille, point.properties.id);
    setParams(next, { replace: true, preventScrollReset: true });
  }

  return (
    <PageLayout>
      <h1 className="text-[28px] font-semibold tracking-tight md:text-[32px]">
        Carte de La Clusaz
      </h1>
      <p className="mt-1 text-sm text-muted md:text-base">
        Repérez les logements, les points d’eau et les services autour du
        village.
      </p>
      <div
        role="group"
        aria-label="Catégories sur la carte"
        className="my-5 flex gap-2 overflow-x-auto pb-1 md:my-6 md:flex-wrap"
      >
        {[["", "Tout"], ...Object.entries(categories)].map(([type, label]) => (
          <button
            type="button"
            key={type}
            aria-pressed={filtre === type}
            onClick={() => setParams(type ? { categorie: type } : {})}
            className="filtre-lieu shrink-0"
            style={{ "--teinte": couleurs[type] || "#222" }}
          >
            {type ? (
              <GlypheLieu categorie={type} size={15} />
            ) : (
              <Layers size={15} />
            )}
            {label}
          </button>
        ))}
      </div>
      {error && (
        <>
          <ErrorMessage error={error} />
          <button
            className="button-tertiary mb-4"
            onClick={() => setRevision(revision + 1)}
          >
            Réessayer
          </button>
        </>
      )}
      <div className="grille-carte">
        <section className="carte-liste" aria-label="Liste des emplacements">
          <div className="border-b border-hairline-soft p-4">
            <label className="flex items-center gap-2 rounded-full bg-surface-soft px-4 py-2.5 focus-within:ring-1 focus-within:ring-ink">
              <Search size={16} className="shrink-0 text-muted" />
              <input
                aria-label="Rechercher un lieu"
                type="search"
                placeholder="Rechercher un lieu…"
                value={recherche}
                onChange={(e) => {
                  setRecherche(e.target.value);
                  if (selection) choisir(null);
                }}
                className="w-full min-w-0 bg-transparent text-sm outline-none"
              />
            </label>
            <p role="status" className="mt-3 text-xs font-semibold text-muted">
              {data
                ? `${points.length} emplacement${points.length > 1 ? "s" : ""}`
                : error
                  ? "Liste indisponible"
                  : "Chargement des lieux…"}
            </p>
          </div>
          {selection && data && !choisi && (
            <p role="status" className="px-4 pt-3 text-sm">
              Cet emplacement est indisponible ou reste à localiser.
            </p>
          )}
          {data && !points.length && (
            <div className="p-4 text-sm">
              <p>Aucun emplacement pour cette sélection.</p>
              <button
                className="button-tertiary mt-3"
                onClick={() => {
                  setRecherche("");
                  setParams({});
                }}
              >
                Voir tous les lieux
              </button>
            </div>
          )}
          <ul ref={liste} className="min-h-0 overflow-y-auto p-2">
            {points.map((point) => (
              <li key={point.id}>
                <button
                  type="button"
                  data-point={point.id}
                  aria-pressed={selection === point.id}
                  onClick={() => {
                    choisir(point);
                    if (window.matchMedia("(max-width: 767px)").matches)
                      cadre.current?.scrollIntoView({
                        block: "center",
                        behavior: "instant",
                      });
                  }}
                  className="flex w-full items-center gap-3 rounded-sm px-2 py-2.5 text-left hover:bg-surface-soft aria-pressed:bg-surface-strong"
                >
                  <IconeLieu categorie={typeLieu(point)} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {point.properties.nom}
                    </span>
                    {point.properties.nom !==
                      categoriesSingulier[typeLieu(point)] && (
                      <span className="block text-xs text-muted">
                        {categoriesSingulier[typeLieu(point)]}
                      </span>
                    )}
                  </span>
                  <ChevronRight size={15} className="shrink-0 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </section>
        <div ref={cadre} className="order-1 min-w-0 md:order-none">
          <Suspense
            fallback={
              <div
                className="carte-cadre grid place-items-center bg-surface-soft"
                role="status"
              >
                Chargement de la carte…
              </div>
            }
          >
            <CarteLieux
              points={points}
              vueVillage={!filtre && !recherche}
              selection={choisi?.id}
              choisir={choisirSurCarte}
              effacer={() => choisir(null)}
            >
              {choisi && (
                <FicheRepere point={choisi} fermer={() => choisir(null)} />
              )}
            </CarteLieux>
          </Suspense>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">
        Lieux recensés par{" "}
        <a className="underline" href="https://www.openstreetmap.org/copyright">
          OpenStreetMap
        </a>{" "}
        et complétés par la mairie.
      </p>
    </PageLayout>
  );
}
