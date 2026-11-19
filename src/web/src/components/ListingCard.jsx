import { Link } from "react-router";

import { typeIcon, typeLabel } from "../data/listingTypes.js";
import { formatPrice, plural } from "../utils/format.js";

export default function ListingCard({ logement }) {
  const TypeIcon = typeIcon(logement.typeLogement);

  return (
    <article className="group min-w-0">
      <Link to={`/logements/${logement.id}`} className="block rounded-md">
        <div className="relative aspect-square overflow-hidden rounded-md bg-surface-strong">
          {logement.photoPrincipale ? (
            <img
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              src={logement.photoPrincipale}
              alt=""
              loading="lazy"
            />
          ) : (
            <div className="grid size-full place-items-center text-muted-soft">
              <div className="flex flex-col items-center gap-2">
                <TypeIcon aria-hidden="true" size={40} strokeWidth={1.25} />
                <span className="text-xs font-medium text-muted">Photos à venir</span>
              </div>
            </div>
          )}
          <span className="photo-badge absolute top-3 left-3">
            {typeLabel(logement.typeLogement)}
          </span>
        </div>

        <div className="mt-3 text-[15px] leading-5">
          <h3 className="truncate font-semibold text-ink">{logement.titre}</h3>
          <p className="mt-0.5 text-muted">
            {logement.adresse.ville} · {plural(logement.capacite, "voyageur")}
          </p>
          <p className="mt-1.5 text-ink">
            <span className="font-semibold">{formatPrice(logement.prixNuitCentimes)}</span>{" "}
            par nuit
          </p>
        </div>
      </Link>
    </article>
  );
}
