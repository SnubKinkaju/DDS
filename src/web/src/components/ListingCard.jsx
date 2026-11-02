import { Heart } from "lucide-react";
import { useState } from "react";

function ListingCard({ listing }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <article className="group min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-card bg-surface-strong">
        <img
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          src={listing.image}
          alt={listing.imageAlt}
          loading="lazy"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-2 text-[11px] font-semibold text-ink shadow-floating">
          {listing.badge}
        </span>
        <button
          className="absolute top-2.5 right-2.5 grid size-11 place-items-center rounded-full text-white drop-shadow-md"
          type="button"
          aria-label={
            isFavorite
              ? `Retirer ${listing.title} des favoris`
              : `Ajouter ${listing.title} aux favoris`
          }
          aria-pressed={isFavorite}
          onClick={() => setIsFavorite((favorite) => !favorite)}
        >
          <Heart
            aria-hidden="true"
            size={25}
            fill={isFavorite ? "#ff385c" : "rgb(0 0 0 / 25%)"}
            color={isFavorite ? "#ff385c" : "white"}
            strokeWidth={2.2}
          />
        </button>
      </div>

      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate text-base font-semibold text-ink">
            {listing.title}
          </h3>
          <span className="shrink-0 text-sm font-semibold text-ink">
            {listing.price} €
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">{listing.location}</p>
        <div className="mt-1 flex items-center justify-between gap-3 text-sm text-muted">
          <span>{listing.details}</span>
          <span>par nuit</span>
        </div>
      </div>
    </article>
  );
}

export default ListingCard;
