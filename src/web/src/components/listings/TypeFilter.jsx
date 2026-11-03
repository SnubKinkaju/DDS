import { Link } from "react-router";

import { allTypes, listingTypes } from "../../data/listingTypes.js";

/** Bandeau de catégories (Tous, Appartement, Chalet…) à la manière d’Airbnb. */
export default function TypeFilter({ params = new URLSearchParams() }) {
  const current = params.get("type") || "";

  function hrefFor(value) {
    const next = new URLSearchParams(params);
    if (value) next.set("type", value);
    else next.delete("type");
    const query = next.toString();
    return query ? `/logements?${query}` : "/logements";
  }

  return (
    <nav aria-label="Types de logement" className="-mx-6 overflow-x-auto px-6 md:mx-0 md:px-0">
      <ul className="flex min-w-max gap-8">
        {[allTypes, ...listingTypes].map(({ value, label, Icon }) => {
          const active = value === current;
          return (
            <li key={label}>
              <Link
                to={hrefFor(value)}
                aria-current={active ? "page" : undefined}
                className={`group flex flex-col items-center gap-2 border-b-2 pt-1 pb-3 text-xs font-semibold transition-colors ${active ? "border-ink text-ink" : "border-transparent text-muted hover:border-hairline hover:text-ink"}`}
              >
                <Icon aria-hidden="true" size={24} strokeWidth={active ? 2 : 1.6} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
