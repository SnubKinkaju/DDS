import { useState } from "react";
import { CloudSun } from "lucide-react";
import useResource from "../../hooks/useResource.js";

export default function Meteo({ compact = false, debut, fin }) {
  const [archive, setArchive] = useState(false);
  const { data, error } = useResource(
    "/api/territoire/meteo" + (archive ? "?archive=1" : ""),
  );
  const jours = (data?.jours || []).filter(
    (j) => !debut || (j.date >= debut && (!fin || j.date < fin)),
  );
  const heure = data?.instant.replace("T", " à ");
  return (
    <section
      className="my-5 rounded-md border border-hairline-soft bg-surface-soft px-5 py-4"
      aria-label="Météo extérieure de La Clusaz"
    >
      <div className="flex flex-wrap items-center gap-3">
        <CloudSun aria-hidden="true" size={23} />
        <h2 className="font-semibold">Météo à La Clusaz</h2>
        {data && (
          <span>
            {data.temperature} °C · {heure}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm">
          Prévision indisponible.{" "}
          <button
            type="button"
            className="button-tertiary"
            onClick={() => setArchive(true)}
          >
            Consulter l’exemple archivé
          </button>
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
            Température extérieure modélisée ·{" "}
            <a href={data.sourceUrl} className="underline">
              Open-Meteo
            </a>{" "}
            · heure de Paris
          </p>
          {(!compact || debut) && (
            <details className="mt-3 text-sm" open={debut ? true : undefined}>
              <summary className="cursor-pointer font-medium">
                {debut
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
                        {j.date}
                        {j.date < data.instant.slice(0, 10) ? " · passé" : ""}
                      </span>
                      <span>
                        {j.min} / {j.max} °C
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {fin &&
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
