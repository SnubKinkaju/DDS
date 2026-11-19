import { Link } from "react-router";
import useResource from "../../hooks/useResource.js";
import ErrorMessage from "../ErrorMessage.jsx";
import { categories, ombrages } from "../../data/territoire.js";

export default function Environnement({ logement }) {
  const { data, error } = useResource(
    `/api/logements/${logement.id}/environnement`,
  );
  const { data: graphe } = useResource(
    `/api/logements/${logement.id}/lieux.jsonld`,
  );
  const protections = data?.protections.equipements ?? [];
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
      <p className="mt-3">
        Ombrage extérieur en été ·{" "}
        {ombrages[logement.ombrage] || "Non renseigné"}
      </p>
      {protections.length > 0 && (
        <p className="mt-1">{protections.join(" · ")}</p>
      )}
      <p className="mt-1 text-xs text-muted">
        Informations déclarées par l’hébergeur
      </p>
      <ErrorMessage error={error} />
      {data && (
        <>
          {data.localisation?.altitudeMetres != null && (
            <p className="mt-4">
              Altitude du terrain · {data.localisation.altitudeMetres} m
              <span className="ml-2 text-xs text-muted">
                <a
                  className="underline"
                  href="https://cartes.gouv.fr/aide/fr/guides-utilisateur/utiliser-les-services-de-la-geoplateforme/calcul-altimetrique/"
                >
                  IGN
                </a>{" "}
                · {data.localisation.altitudeLe?.slice(0, 10)}
              </span>
            </p>
          )}
          <h3 className="mt-7 text-lg font-semibold">Autour du logement</h3>
          {data.lieux.length ? (
            <>
              <p className="mt-1 text-sm text-muted">
                Distances à vol d’oiseau, dans un rayon de 2 km.
              </p>
              <ul className="mt-3 divide-y divide-hairline-soft">
                {data.lieux.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-start justify-between gap-4 py-3"
                  >
                    <div>
                      <Link
                        className="font-medium hover:underline"
                        to={`/carte?lieu=${p.id}`}
                      >
                        {p.nom}
                      </Link>
                      <p className="text-xs text-muted">
                        {categories[p.categorie]} ·{" "}
                        {p.acces === "public"
                          ? "Accès public"
                          : "Accès à vérifier"}
                        {p.position === "centre" && " · point représentatif"}
                        {p.categorie === "lac" && " · conditions de baignade à vérifier"}
                      </p>
                      <a className="text-xs underline" href={p.sourceUrl}>
                        {p.source === "osm"
                          ? "OpenStreetMap"
                          : "Source municipale"}{" "}
                        · {(p.verifieLe || p.collecteLe).slice(0, 10)}
                      </a>
                    </div>
                    <span className="shrink-0 text-sm">
                      {p.distanceMetres} m
                    </span>
                  </li>
                ))}
              </ul>
              {data.lieux.some((p) => p.categorie === "transport") && (
                <a
                  className="button-tertiary mt-3"
                  href="https://www.laclusaz.com/details/navettes-et-skibus-de-la-clusaz/"
                >
                  Horaires saisonniers des navettes
                </a>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">
              {!data.localisation
                ? "L’adresse précise reste à localiser."
                : data.importLe
                  ? "Aucun service recensé dans ce rayon."
                  : "Catalogue territorial en attente de collecte."}
            </p>
          )}
        </>
      )}
    </section>
  );
}
