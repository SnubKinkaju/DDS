import { SearchX } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import EmptyState from "../components/EmptyState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import PageLayout from "../components/PageLayout.jsx";
import ListingGrid, {
  ListingGridSkeleton,
} from "../components/listings/ListingGrid.jsx";
import ListingSearch from "../components/listings/ListingSearch.jsx";
import TypeFilter from "../components/listings/TypeFilter.jsx";
import { typeLabel } from "../data/listingTypes.js";
import useListings from "../hooks/useListings.js";
import { plural } from "../utils/format.js";

const normalize = (value) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function CataloguePage() {
  const { logements, loading, error } = useListings();
  const [params, setParams] = useSearchParams();
  const search = params.get("recherche") || "";
  const type = params.get("type") || "";
  const guests = Math.max(1, Number(params.get("voyageurs")) || 1);
  const filtered = logements.filter(
    (item) =>
      (!type || item.typeLogement === type) &&
      (!params.has("volets") || item.volets) &&
      (!params.has("ombre") ||
        ["partiel", "important"].includes(item.ombrage)) &&
      item.capacite >= guests &&
      normalize(`${item.titre} ${item.description}`).includes(
        normalize(search),
      ),
  );
  const hasFilters = Boolean(
    search || type || guests > 1 || params.has("ombre") || params.has("volets"),
  );

  const summary = [
    type ? typeLabel(type) : "Tous les logements",
    search && `« ${search} »`,
    guests > 1 && `${guests} voyageurs`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <PageLayout>
      <div className="mx-auto max-w-[850px]">
        <ListingSearch
          key={JSON.stringify([search, guests])}
          initial={Object.fromEntries(params)}
        />
      </div>

      <div className="mt-10 border-b border-hairline-soft">
        <TypeFilter params={params} />
      </div>

      <fieldset className="mt-5 flex flex-wrap gap-2 text-sm">
        <legend className="sr-only">Protections contre la chaleur</legend>
        {[
          ["volets", "Volets"],
          ["ombre", "Extérieur ombragé"],
        ].map(([key, label]) => (
          <label
            className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-hairline px-4 has-checked:border-ink has-checked:bg-surface-soft"
            key={key}
          >
            <input
              className="accent-ink"
              type="checkbox"
              checked={params.has(key)}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                if (e.target.checked) next.set(key, "1");
                else next.delete(key);
                setParams(next);
              }}
            />
            {label}
          </label>
        ))}
      </fieldset>
      <div className="mt-8 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-ink">{summary}</h1>
          {!loading && !error && (
            <p className="mt-1 text-sm text-muted">
              {plural(filtered.length, "logement")} à La Clusaz
            </p>
          )}
        </div>
        {hasFilters && (
          <Link className="button-tertiary" to="/logements">
            Effacer les filtres
          </Link>
        )}
      </div>

      <ErrorMessage error={error} />
      {loading && <ListingGridSkeleton count={8} />}
      {!loading && !error && filtered.length > 0 && (
        <ListingGrid logements={filtered} />
      )}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          Icon={SearchX}
          title="Aucun logement ne correspond"
          action={
            hasFilters && (
              <Link className="button-secondary" to="/logements">
                Effacer les filtres
              </Link>
            )
          }
        >
          Essayez avec moins de voyageurs, un autre type de logement ou un autre
          mot-clé.
        </EmptyState>
      )}
    </PageLayout>
  );
}
