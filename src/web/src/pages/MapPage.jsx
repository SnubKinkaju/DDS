import { ExternalLink, List } from "lucide-react";
import { Link } from "react-router";

import PageLayout from "../components/PageLayout.jsx";

const mapUrl =
  "https://www.openstreetmap.org/export/embed.html?bbox=6.3998405%2C45.8609772%2C6.5309810%2C45.9353031&layer=mapnik&marker=45.9043659%2C6.4239011";

function MapPage() {
  return (
    <PageLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold text-ink">Carte de La Clusaz</h1>
          <p className="mt-1 max-w-2xl text-base text-muted">
            Repérez les quartiers où se trouvent les logements-refuges.
          </p>
        </div>
        <Link className="button-secondary button-small" to="/logements">
          <List aria-hidden="true" size={16} />
          Voir la liste
        </Link>
      </div>

      <div className="relative mt-8 overflow-hidden rounded-lg border border-hairline-soft bg-surface-strong">
        <iframe
          className="h-[60vh] min-h-[420px] w-full border-0 md:h-[640px]"
          src={mapUrl}
          title="Carte OpenStreetMap de La Clusaz"
          loading="lazy"
        />
      </div>

      <div className="mt-4 flex flex-col justify-between gap-3 text-sm text-muted sm:flex-row sm:items-center">
        <p>
          Les logements apparaîtront sur la carte dès que leurs coordonnées seront
          enregistrées.
        </p>
        <a
          className="button-tertiary shrink-0"
          href="https://www.openstreetmap.org/?mlat=45.9043659&mlon=6.4239011#map=14/45.90437/6.42390"
          target="_blank"
          rel="noreferrer"
        >
          Ouvrir dans OpenStreetMap
          <ExternalLink aria-hidden="true" size={14} />
        </a>
      </div>
    </PageLayout>
  );
}

export default MapPage;
