import { useState } from "react";
import { Minus, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router";

import { plural } from "../../utils/format.js";

const MAX_GUESTS = 20;

export default function ListingSearch({ initial = {} }) {
  const navigate = useNavigate();
  const [guests, setGuests] = useState(
    Math.min(MAX_GUESTS, Math.max(1, Number(initial.voyageurs) || 1)),
  );

  function search(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    const keyword = new FormData(event.currentTarget).get("recherche").trim();
    if (keyword) params.set("recherche", keyword);
    if (initial.type) params.set("type", initial.type);
    if (guests > 1) params.set("voyageurs", guests);
    const query = params.toString();
    navigate(query ? `/logements?${query}` : "/logements");
  }

  return (
    <form
      action="/logements"
      onSubmit={search}
      role="search"
      aria-label="Rechercher un logement"
      className="flex flex-col rounded-[28px] border border-hairline bg-white shadow-floating sm:h-16 sm:flex-row sm:items-center sm:rounded-full"
    >
      <label className="flex min-w-0 flex-1 cursor-text flex-col justify-center rounded-full px-6 py-3 transition-colors hover:bg-surface-soft sm:h-full sm:px-8">
        <span className="text-xs font-semibold text-ink">Recherche</span>
        <input
          name="recherche"
          defaultValue={initial.recherche || ""}
          placeholder="Chalet, terrasse, calme…"
          className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
      </label>

      <span aria-hidden="true" className="mx-6 h-px bg-hairline-soft sm:mx-0 sm:h-8 sm:w-px sm:bg-hairline" />

      <div className="flex items-center justify-between gap-4 rounded-full px-6 py-3 sm:h-full sm:justify-start sm:pr-2 sm:pl-6">
        <div className="sm:w-28">
          <span id="guests-label" className="block text-xs font-semibold text-ink">
            Voyageurs
          </span>
          <span className="block text-sm text-muted" aria-live="polite">
            {plural(guests, "voyageur")}
          </span>
        </div>
        <div className="flex items-center gap-2" role="group" aria-labelledby="guests-label">
          <button
            type="button"
            onClick={() => setGuests((value) => Math.max(1, value - 1))}
            disabled={guests <= 1}
            aria-label="Retirer un voyageur"
            className="grid size-8 place-items-center rounded-full border border-hairline text-muted transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-hairline"
          >
            <Minus aria-hidden="true" size={14} />
          </button>
          <button
            type="button"
            onClick={() => setGuests((value) => Math.min(MAX_GUESTS, value + 1))}
            disabled={guests >= MAX_GUESTS}
            aria-label="Ajouter un voyageur"
            className="grid size-8 place-items-center rounded-full border border-hairline text-muted transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus aria-hidden="true" size={14} />
          </button>
        </div>
        <button
          type="submit"
          aria-label="Rechercher"
          className="hidden size-12 shrink-0 place-items-center rounded-full bg-primary text-white transition-colors hover:bg-primary-active sm:ml-2 sm:grid"
        >
          <Search aria-hidden="true" size={18} strokeWidth={3} />
        </button>
      </div>

      <div className="px-4 pb-4 sm:hidden">
        <button type="submit" className="button-primary w-full rounded-full">
          <Search aria-hidden="true" size={18} strokeWidth={2.6} />
          Rechercher
        </button>
      </div>
    </form>
  );
}
