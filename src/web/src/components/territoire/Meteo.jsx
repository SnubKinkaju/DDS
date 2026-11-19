import { useState } from "react";
import { CloudSun, Thermometer } from "lucide-react";
import { formatDate } from "../../utils/dates.js";
import useResource from "../../hooks/useResource.js";

export default function Meteo({ compact = false, debut, fin }) {
  const [archive, setArchive] = useState(false);
  const [revision, setRevision] = useState(0);
  const { data, error } = useResource(
    "/api/territoire/meteo" + (archive ? "?archive=1" : ""),
    revision,
  );
  const jours = (data?.jours || []).filter(
    (j) => archive || !debut || (j.date >= debut && (!fin || j.date < fin)),
  );
  const heure =
    data &&
    formatDate(data.instant.slice(0, 10)) + " à " + data.instant.slice(11, 16);
  function actualiser() {
    setArchive(false);
    setRevision((v) => v + 1);
  }
  return (
    <section
      className="my-4 rounded-md border border-sky-900/10 bg-sky-50/60 p-4"
      aria-label="Météo extérieure de La Clusaz"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-white text-sky-800">
          <CloudSun aria-hidden="true" size={21} />
        </span>
        <h2 className="font-semibold">Météo à La Clusaz</h2>
        {data && (
          <span className="ml-auto flex items-center gap-1 text-lg font-semibold tabular-nums">
            <Thermometer size={15} aria-hidden="true" />
            {data.temperature} °C
          </span>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm">
          Prévision indisponible.{" "}
          <button
            type="button"
            className="button-tertiary"
            onClick={actualiser}
          >
            Réessayer
          </button>
          {!archive && " · "}
          {!archive && (
            <button
              type="button"
              className="button-tertiary"
              onClick={() => setArchive(true)}
            >
              Consulter l’exemple archivé
            </button>
          )}
        </p>
      )}
      {!error && !data && (
        <p role="status" className="text-sm">
          Chargement de la météo…
        </p>
      )}
      {data && (
        <>
          <p className="mt-1 text-xs text-muted">
            {archive
              ? "Exemple archivé · "
              : data.etat === "dernier_succes"
                ? "Dernière prévision disponible · "
                : ""}
            {heure} · heure de Paris
            <br />
            Température extérieure modélisée ·{" "}
            <a href={data.sourceUrl} className="underline">
              Open-Meteo
            </a>
          </p>
          {archive && (
            <button className="button-tertiary mt-2" onClick={actualiser}>
              Revenir à la météo actuelle
            </button>
          )}
          {(!compact || debut) && (
            <details className="mt-3 text-sm" open={debut ? true : undefined}>
              <summary className="cursor-pointer font-medium">
                {archive
                  ? "Relevés de l’exemple archivé"
                  : debut
                    ? "Prévisions pour le séjour"
                    : "Minima et maxima par jour"}
              </summary>
              {!jours.length ? (
                <p className="mt-2">
                  Les dates choisies sont hors de la période de prévision.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-hairline-soft">
                  {jours.map((j) => (
                    <li key={j.date} className="flex justify-between py-1">
                      <span>
                        {formatDate(j.date)}
                        {j.date < data.instant.slice(0, 10) ? " · passé" : ""}
                      </span>
                      <span>
                        {j.min} / {j.max} °C
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {!archive &&
                fin &&
                jours.length > 0 &&
                jours.length <
                  (Date.parse(fin) - Date.parse(debut)) / 86400000 && (
                  <p>La prévision couvre seulement les jours affichés.</p>
                )}
            </details>
          )}
        </>
      )}
    </section>
  );
}
