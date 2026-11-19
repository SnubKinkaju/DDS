import { useState } from "react";
import { ArrowUpRight, MapPin, Mountain, Trees } from "lucide-react";
import { Link } from "react-router";
import useResource from "../../hooks/useResource.js";
import ErrorMessage from "../ErrorMessage.jsx";
import { categoriesSingulier, ombrages } from "../../data/territoire.js";
import { amenityIcon } from "../../data/listingTypes.js";
import { formatDate } from "../../utils/dates.js";
import IconeLieu from "./IconeLieu.jsx";

function LieuProche({ lieu }) {
  const date = (lieu.verifieLe || lieu.collecteLe).slice(0, 10);
  return (
    <li className="flex items-start gap-3 border-b border-hairline-soft py-3.5">
      <IconeLieu categorie={lieu.categorie} />
      <div className="min-w-0 flex-1">
        <Link
          className="font-semibold hover:underline"
          to={`/carte?lieu=${lieu.id}`}
        >
          {lieu.nom}
        </Link>
        <p className="mt-0.5 text-xs leading-5 text-muted">
          {categoriesSingulier[lieu.categorie]} ·{" "}
          {lieu.acces === "public" ? "Accès public" : "Accès à vérifier"}
          {lieu.position === "centre" && " · point représentatif"}
          {lieu.categorie === "lac" && " · conditions de baignade à vérifier"}
        </p>
        <a
          className="inline-flex items-center gap-1 text-xs text-muted underline underline-offset-2"
          href={lieu.sourceUrl}
        >
          {lieu.source === "osm" ? "OpenStreetMap" : "Source municipale"} ·{" "}
          {formatDate(date)} <ArrowUpRight size={12} />
        </a>
      </div>
      <span className="rounded-full bg-surface-soft px-2.5 py-1 text-xs font-semibold tabular-nums">
        {lieu.distanceMetres} m
      </span>
    </li>
  );
}

export default function Environnement({ logement }) {
  const { data, error } = useResource(
    `/api/logements/${logement.id}/environnement`,
  );
  const { data: graphe } = useResource(
    `/api/logements/${logement.id}/lieux.jsonld`,
  );
  const [tous, setTous] = useState(false);
  const localisation = data?.localisation;
  const lieux = data?.lieux || [];
  const adresse = logement.adresse;
  return (
    <section className="border-b border-hairline-soft py-8">
      {graphe && (
        <script type="application/ld+json">
          {JSON.stringify(graphe).replaceAll("<", "\\u003c")}
        </script>
      )}
      <h2 className="text-[22px] font-semibold">
        Protection contre la chaleur
      </h2>
      <p className="mt-1 text-sm text-muted">
        Informations déclarées par l’hébergeur
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="climat-mesure">
          <Trees size={18} />
          Ombrage · {ombrages[logement.ombrage]}
        </span>
        {data?.protections.equipements.map((nom) => {
          const Icon = amenityIcon(nom);
          return (
            <span className="climat-mesure" key={nom}>
              <Icon size={18} />
              {nom}
            </span>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[22px] font-semibold">Autour du logement</h2>
        {localisation && (
          <Link
            to={`/carte?logement=${logement.id}`}
            className="button-tertiary"
          >
            <MapPin size={15} />
            Voir sur la carte
          </Link>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        {adresse.rue}, {adresse.codePostal} {adresse.ville}
      </p>
      {localisation?.altitudeMetres != null && (
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <Mountain size={16} />
          Altitude du terrain · {localisation.altitudeMetres} m
          <a
            className="underline"
            href="https://cartes.gouv.fr/aide/fr/guides-utilisateur/utiliser-les-services-de-la-geoplateforme/calcul-altimetrique/"
          >
            IGN
          </a>
          {localisation.altitudeLe && (
            <>· {formatDate(localisation.altitudeLe.slice(0, 10))}</>
          )}
        </p>
      )}
      <ErrorMessage error={error} />
      {!data && !error && (
        <p role="status" className="mt-3 text-sm text-muted">
          Recherche des lieux proches…
        </p>
      )}
      {data &&
        (lieux.length ? (
          <>
            <p className="mt-5 text-sm text-muted">
              Distances à vol d’oiseau, dans un rayon de{" "}
              {data.rayonMetres / 1000} km.
            </p>
            <ul id="lieux-proches">
              {(tous ? lieux : lieux.slice(0, 6)).map((lieu) => (
                <LieuProche key={lieu.id} lieu={lieu} />
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-4">
              {lieux.length > 6 && (
                <button
                  className="button-tertiary"
                  aria-expanded={tous}
                  aria-controls="lieux-proches"
                  onClick={() => setTous(!tous)}
                >
                  {tous ? "Afficher moins" : `Voir les ${lieux.length} lieux`}
                </button>
              )}
              {lieux.some((p) => p.categorie === "transport") && (
                <a
                  className="button-tertiary"
                  href="https://www.laclusaz.com/details/navettes-et-skibus-de-la-clusaz/"
                >
                  Horaires des navettes <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </>
        ) : (
          <p className="mt-4 rounded-md bg-surface-soft p-4 text-sm text-muted">
            {!localisation
              ? "L’adresse précise reste à localiser."
              : data.importLe
                ? "Aucun service recensé dans ce rayon."
                : "Catalogue territorial en attente de collecte."}{" "}
            <Link to="/carte" className="underline">
              Explorer la carte de La Clusaz
            </Link>
          </p>
        ))}
    </section>
  );
}
