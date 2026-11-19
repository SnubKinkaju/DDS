import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, House } from "lucide-react";
import { Link } from "react-router";

import EmptyState from "../components/EmptyState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import PageLayout from "../components/PageLayout.jsx";
import ListingCard from "../components/ListingCard.jsx";
import { ListingGridSkeleton } from "../components/listings/ListingGrid.jsx";
import ListingSearch from "../components/listings/ListingSearch.jsx";
import TypeFilter from "../components/listings/TypeFilter.jsx";
import useListings from "../hooks/useListings.js";

export default function HomePage() {
  const { logements, loading, error } = useListings();
  const latestLogements = logements.slice(0, 10);
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    function updateControls() {
      setCanScrollLeft(carousel.scrollLeft > 1);
      setCanScrollRight(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1);
    }

    updateControls();
    carousel.addEventListener("scroll", updateControls, { passive: true });
    const observer = new ResizeObserver(updateControls);
    observer.observe(carousel);
    return () => {
      carousel.removeEventListener("scroll", updateControls);
      observer.disconnect();
    };
  }, [loading, logements.length]);

  function scrollListings(direction) {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({
      left: direction * carousel.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 id="latest-title" className="text-[22px] font-semibold text-ink">
            Les derniers logements
          </h2>
          {logements.length > 0 && (
            <div className="flex items-center gap-4">
              <Link to="/logements" className="button-tertiary shrink-0">
                Tout afficher
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Voir les logements précédents"
                  aria-controls="latest-listings"
                  disabled={!canScrollLeft}
                  onClick={() => scrollListings(-1)}
                  className="grid size-9 place-items-center rounded-full bg-primary text-white shadow-sm transition duration-150 enabled:hover:scale-105 enabled:hover:bg-primary-active enabled:active:scale-95 disabled:cursor-default disabled:bg-primary/10 disabled:text-primary/35 disabled:shadow-none motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <ChevronLeft aria-hidden="true" size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Voir les logements suivants"
                  aria-controls="latest-listings"
                  disabled={!canScrollRight}
                  onClick={() => scrollListings(1)}
                  className="grid size-9 place-items-center rounded-full bg-primary text-white shadow-sm transition duration-150 enabled:hover:scale-105 enabled:hover:bg-primary-active enabled:active:scale-95 disabled:cursor-default disabled:bg-primary/10 disabled:text-primary/35 disabled:shadow-none motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <ChevronRight aria-hidden="true" size={18} />
                </button>
              </div>
            </div>
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
          <div
            id="latest-listings"
            ref={carouselRef}
            role="region"
            aria-labelledby="latest-title"
            tabIndex={0}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain p-1 -m-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {latestLogements.map((logement) => (
              <div
                key={logement.id}
                className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] xl:w-[calc((100%-72px)/4)]"
              >
                <ListingCard logement={logement} />
              </div>
            ))}
          </div>
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
