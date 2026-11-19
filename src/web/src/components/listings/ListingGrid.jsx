import ListingCard from "../ListingCard.jsx";

const gridClass =
  "grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export default function ListingGrid({ logements }) {
  return (
    <div className={gridClass}>
      {logements.map((logement) => (
        <ListingCard key={logement.id} logement={logement} />
      ))}
    </div>
  );
}

export function ListingGridSkeleton({ count = 4 }) {
  return (
    <div className={gridClass} role="status" aria-label="Chargement des logements">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-square rounded-md bg-surface-strong" />
          <div className="mt-3 h-4 w-3/4 rounded bg-surface-strong" />
          <div className="mt-2 h-4 w-1/2 rounded bg-surface-strong" />
          <div className="mt-2 h-4 w-1/3 rounded bg-surface-strong" />
        </div>
      ))}
    </div>
  );
}
