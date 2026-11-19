import { useEffect, useState } from "react";
import { request } from "../../services/api.js";
import ErrorMessage from "../ErrorMessage.jsx";

export default function Disponibilites({ id }) {
  const path = `/api/logements/${id}/disponibilites`;
  const [periods, setPeriods] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    request(path, { signal: controller.signal })
      .then((data) => setPeriods(data.periodes))
      .catch((err) => {
        if (!controller.signal.aborted) setError(err);
      });
    return () => controller.abort();
  }, [path]);
  function edit(i, key, value) {
    setPeriods((items) =>
      items.map((p, n) => (n === i ? { ...p, [key]: value } : p)),
    );
    setNotice("");
  }
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await request(path, {
        method: "PUT",
        body: JSON.stringify({ periodes: periods }),
      });
      setPeriods(result.periodes);
      setNotice(
        "Disponibilités enregistrées." +
          (result.demandesHorsPeriode
            ? ` ${result.demandesHorsPeriode} demande(s) en attente hors période.`
            : ""),
      );
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="my-6 border-b border-hairline-soft pb-6">
      <h2 className="text-xl font-semibold">Disponibilités</h2>
      <p className="my-2 text-sm text-muted">
        Sans période définie, toutes les nuits libres peuvent être demandées. La
        date de fin est le jour du départ.
      </p>
      <ErrorMessage error={error} />
      {periods && (
        <form onSubmit={save}>
          <fieldset disabled={busy} className="space-y-3">
            {periods.map((p, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3">
                <label>
                  Du
                  <input
                    className="form-control"
                    required
                    type="date"
                    value={p.dateDebut}
                    onChange={(e) => edit(i, "dateDebut", e.target.value)}
                  />
                </label>
                <label>
                  Au
                  <input
                    className="form-control"
                    required
                    type="date"
                    value={p.dateFin}
                    onChange={(e) => edit(i, "dateFin", e.target.value)}
                  />
                </label>
                <button
                  className="button-tertiary"
                  type="button"
                  onClick={() => {
                    setPeriods(periods.filter((_, n) => n !== i));
                    setNotice("");
                  }}
                >
                  Retirer
                </button>
              </div>
            ))}
            <div className="flex gap-4">
              <button
                type="button"
                className="button-tertiary"
                onClick={() => {
                  setPeriods([...periods, { dateDebut: "", dateFin: "" }]);
                  setNotice("");
                }}
              >
                Ajouter une période
              </button>
              <button className="button-secondary button-small">
                Enregistrer les dates
              </button>
            </div>
            <p role="status" className="text-sm">
              {notice}
            </p>
          </fieldset>
        </form>
      )}
    </section>
  );
}
