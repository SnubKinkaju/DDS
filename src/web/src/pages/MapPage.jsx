import { lazy, Suspense, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import PageLayout from "../components/PageLayout.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import useResource from "../hooks/useResource.js";
import { categories, couleurs } from "../data/territoire.js";

const CarteLieux = lazy(
  () => import("../components/territoire/CarteLieux.jsx"),
);

export default function MapPage() {
  const { data, error } = useResource("/api/territoire/carte.geojson");
  const [params, setParams] = useSearchParams();
  const filtre = params.get("categorie") || "";
  const famille = params.has("lieu")
    ? "lieu"
    : params.has("logement")
      ? "logement"
      : null;
  const selection = famille ? famille + "-" + params.get(famille) : null;
  const points = useMemo(
    () =>
      (data?.features || []).filter(
        ({ properties: p }) => !filtre || (p.categorie || p.famille) === filtre,
      ),
    [data, filtre],
  );
  const choisi = points.find((p) => p.id === selection);
  function choisir(point) {
    const next = new URLSearchParams(params);
    next.delete("lieu");
    next.delete("logement");
    next.set(point.properties.famille, point.properties.id);
    setParams(next, { replace: true });
  }
  return (
    <PageLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold">Carte de La Clusaz</h1>
          <p className="mt-1 text-muted">
            Logements, eau, santé et transports dans la commune et ses abords.
          </p>
        </div>
        <label className="text-sm">
          Afficher
          <select
            className="form-control"
            value={filtre}
            onChange={(e) =>
              setParams(e.target.value ? { categorie: e.target.value } : {})
            }
          >
            <option value="">Tous les lieux</option>
            {Object.entries(categories).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ErrorMessage error={error} />
      <div className="grid items-start gap-5 md:grid-cols-[2fr_1fr]">
        <Suspense fallback={<p>Chargement de la carte…</p>}>
          <CarteLieux
            points={points}
            selection={choisi?.id}
            choisir={choisir}
          />
        </Suspense>
        <section className="min-w-0">
          {choisi && (
            <div className="mb-3 rounded-md bg-surface-soft p-4">
              <h2 className="font-semibold">{choisi.properties.nom}</h2>
              <p className="my-1 text-sm">
                {categories[choisi.properties.categorie || "logement"]}
              </p>
              {choisi.properties.famille === "logement" ? (
                <Link className="button-tertiary" to={choisi.properties.url}>
                  Voir le logement
                </Link>
              ) : (
                <a
                  className="button-tertiary"
                  href={choisi.properties.sourceUrl}
                >
                  Consulter la source
                </a>
              )}
            </div>
          )}
          {selection && data && !choisi && (
            <p role="status">
              Cet emplacement est indisponible ou reste à localiser.
            </p>
          )}
          <h2 className="mb-2 text-lg font-semibold">
            {points.length} emplacement{points.length > 1 ? "s" : ""}
          </h2>
          <ul className="max-h-[42vh] overflow-auto divide-y divide-hairline-soft border-y border-hairline-soft">
            {points.map((p) => (
              <li key={p.id}>
                <button
                  className="flex w-full items-center gap-2 py-2 text-left text-sm hover:underline"
                  type="button"
                  aria-pressed={choisi?.id === p.id}
                  onClick={() => choisir(p)}
                >
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-full"
                    style={{
                      background:
                        couleurs[p.properties.categorie || "logement"],
                    }}
                  />
                  {p.properties.nom}
                  <small className="ml-auto text-muted">
                    {categories[p.properties.categorie || "logement"]}
                  </small>
                </button>
              </li>
            ))}
          </ul>
          {data && !points.length && (
            <p className="mt-3 text-sm">
              Aucun emplacement recensé pour cette sélection.
            </p>
          )}
        </section>
      </div>
      <p className="mt-4 text-xs text-muted">
        Données géographiques ·{" "}
        <a className="underline" href="https://www.openstreetmap.org/copyright">
          © les contributeurs OpenStreetMap
        </a>{" "}
        et compléments municipaux.
      </p>
    </PageLayout>
  );
}
