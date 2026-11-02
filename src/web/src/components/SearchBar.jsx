import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

function SearchBar() {
  const navigate = useNavigate();
  const [dateArrivee, setDateArrivee] = useState("");
  const [voyageurs, setVoyageurs] = useState("1");

  function handleSubmit(event) {
    event.preventDefault();

    const query = new URLSearchParams();
    if (dateArrivee) query.set("arrivee", dateArrivee);
    if (voyageurs) query.set("voyageurs", voyageurs);

    const search = query.toString();
    navigate(`/logements${search ? `?${search}` : ""}`);
  }

  return (
    <form
      className="grid overflow-hidden rounded-3xl border border-hairline bg-white shadow-floating md:grid-cols-[1.25fr_1fr_0.8fr_auto] md:rounded-full"
      aria-label="Rechercher un logement"
      onSubmit={handleSubmit}
    >
      <label className="flex min-h-16 flex-col justify-center border-b border-hairline-soft px-6 md:border-r md:border-b-0">
        <span className="text-xs font-semibold text-ink">Où</span>
        <select
          className="mt-1 w-full appearance-none bg-transparent text-sm text-muted outline-none"
          defaultValue="la-clusaz"
          aria-label="Destination"
        >
          <option value="la-clusaz">La Clusaz</option>
        </select>
      </label>

      <label className="flex min-h-16 flex-col justify-center border-b border-hairline-soft px-6 md:border-r md:border-b-0">
        <span className="text-xs font-semibold text-ink">Arrivée</span>
        <input
          className="mt-1 bg-transparent text-sm text-muted outline-none"
          type="date"
          value={dateArrivee}
          onChange={(event) => setDateArrivee(event.target.value)}
        />
      </label>

      <label className="flex min-h-16 flex-col justify-center border-b border-hairline-soft px-6 md:border-b-0">
        <span className="text-xs font-semibold text-ink">Voyageurs</span>
        <input
          className="mt-1 w-full bg-transparent text-sm text-muted outline-none"
          type="number"
          min="1"
          max="10"
          value={voyageurs}
          onChange={(event) => setVoyageurs(event.target.value)}
        />
      </label>

      <div className="flex items-center justify-end p-2.5 md:justify-center">
        <button
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-active md:w-12 md:px-0"
          type="submit"
        >
          <Search aria-hidden="true" size={19} strokeWidth={2.5} />
          <span className="md:sr-only">Rechercher</span>
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
