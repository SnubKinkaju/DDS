import { ArrowRight, House } from "lucide-react";
import { Link } from "react-router";

import EmptyState from "../components/EmptyState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import PageLayout from "../components/PageLayout.jsx";
import ListingGrid, { ListingGridSkeleton } from "../components/listings/ListingGrid.jsx";
import ListingSearch from "../components/listings/ListingSearch.jsx";
import TypeFilter from "../components/listings/TypeFilter.jsx";
import useListings from "../hooks/useListings.js";

export default function HomePage() {
  const { logements, loading, error } = useListings();

  return (
    <PageLayout>
      <section aria-labelledby="home-title" className="mx-auto max-w-[850px] text-center">
        <h1 id="home-title" className="text-[28px] leading-tight font-bold text-ink">
          Un refuge au frais, à La Clusaz
        </h1>
        <p className="mt-2 text-base text-muted">
          Des logements chez l’habitant pour souffler pendant les fortes chaleurs.
        </p>
        <div className="mt-8 text-left">
          <ListingSearch />
        </div>
      </section>

      <div className="mt-12 border-b border-hairline-soft">
        <TypeFilter />
      </div>

      <section aria-labelledby="latest-title" className="mt-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="latest-title" className="text-[22px] font-semibold text-ink">
            Les derniers logements
          </h2>
          {logements.length > 0 && (
            <Link to="/logements" className="button-tertiary shrink-0">
              Tout afficher
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          )}
        </div>

        <ErrorMessage error={error} />
        {loading && <ListingGridSkeleton count={4} />}
        {!loading && !error && logements.length === 0 && (
          <EmptyState
            Icon={House}
            title="Les premières annonces arrivent"
            action={
              <Link to="/publier" className="button-secondary">
                Proposer mon logement
              </Link>
            }
          >
            Les logements publiés par les habitants apparaîtront ici.
          </EmptyState>
        )}
        {!loading && logements.length > 0 && (
          <ListingGrid logements={logements.slice(0, 8)} />
        )}
      </section>

      <section
        aria-labelledby="host-title"
        className="mt-16 grid overflow-hidden rounded-lg bg-surface-soft md:h-[340px] md:grid-cols-2"
      >
        <img
          src="/images/refuge-hero.jpg"
          alt=""
          className="h-56 w-full object-cover md:h-full"
        />
        <div className="flex flex-col justify-center p-8 md:p-12">
          <h2 id="host-title" className="text-[22px] font-semibold text-ink">
            Vous avez un logement à La Clusaz ?
          </h2>
          <p className="mt-3 max-w-md text-base leading-6 text-body">
            Proposez-le aux personnes qui cherchent un endroit plus frais pendant
            les épisodes de canicule. La publication ne prend que quelques
            minutes.
          </p>
          <div className="mt-6">
            <Link to="/publier" className="button-primary">
              Publier un logement
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
