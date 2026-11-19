import { useState } from "react";
import useResource from "../../hooks/useResource.js";
import { request } from "../../services/api.js";
import { categories } from "../../data/territoire.js";
import ErrorMessage from "../ErrorMessage.jsx";

const vide = {
  nom: "",
  categorie: "lieu_frais",
  acces: "public",
  sourceUrl: "",
  latitude: "",
  longitude: "",
};

export default function AdminTerritoire() {
  const [revision, setRevision] = useState(0);
  const { data, error } = useResource("/api/admin/territoire", revision);
  const [form, setForm] = useState(vide);
  const [editing, setEditing] = useState(null);
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);
  function ouvrir(lieu) {
    setEditing(lieu?.id ?? null);
    setForm(
      lieu
        ? Object.fromEntries(Object.keys(vide).map((k) => [k, lieu[k]]))
        : vide,
    );
    setFailure(null);
  }
  async function modifier(supprimer = false) {
    if (
      supprimer &&
      !window.confirm("Retirer ce lieu de la carte et des fiches ?")
    )
      return;
    setBusy(true);
    setFailure(null);
    try {
      await request("/api/admin/lieux" + (editing ? "/" + editing : ""), {
        method: supprimer ? "DELETE" : editing ? "PUT" : "POST",
        body: supprimer
          ? undefined
          : JSON.stringify({
              ...form,
              latitude: Number(form.latitude),
              longitude: Number(form.longitude),
            }),
      });
      ouvrir(null);
      setRevision((v) => v + 1);
    } catch (err) {
      setFailure(err);
    } finally {
      setBusy(false);
    }
  }
  function champ(key) {
    return {
      value: form[key],
      className: "form-control",
      required: true,
      onChange: (e) => setForm({ ...form, [key]: e.target.value }),
    };
  }
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">Services du territoire</h2>
      <ErrorMessage error={error || failure} />
      {data && (
        <>
          <p className="my-3 text-sm text-muted">
            {data.import?.succes_le
              ? "Source OSM du " + data.import.succes_le.slice(0, 10)
              : "Import OSM en attente"}
            {data.import &&
              " · dernière tentative " +
                data.import.tentative_le.slice(0, 10) +
                " · " +
                data.import.resultat}
          </p>
          <table className="w-full max-w-xl text-left text-sm">
            <thead>
              <tr>
                {[
                  "Catégorie",
                  "Recensés",
                  "Public confirmé",
                  "Accès inconnu",
                ].map((x) => (
                  <th key={x}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.categories.map((c) => (
                <tr key={c.code} className="border-t border-hairline-soft">
                  <td className="py-1">{c.nom}</td>
                  <td>{c.total}</td>
                  <td>
                    {c.confirmes}
                    {c.derniereVerification && (
                      <small className="block text-muted">
                        Vérifié le {c.derniereVerification.slice(0, 10)}
                      </small>
                    )}
                  </td>
                  <td>{c.inconnus}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.accesAConfirmer.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">
                Lieux dont l’accès reste à vérifier (
                {data.accesAConfirmer.length})
              </summary>
              <ul className="mt-3 max-h-64 max-w-xl overflow-auto divide-y divide-hairline-soft">
                {data.accesAConfirmer.map((lieu) => (
                  <li key={lieu.id} className="py-2 text-sm">
                    <a className="underline" href={lieu.url}>
                      {lieu.nom}
                    </a>
                    <span className="ml-2 text-muted">
                      {categories[lieu.categorie]} ·{" "}
                      {lieu.collecteLe.slice(0, 10)}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <details className="mt-4">
            <summary className="cursor-pointer font-semibold">
              Gérer les lieux municipaux
            </summary>
            <label className="mt-3 block max-w-xl">
              Lieu à modifier
              <select
                className="form-control"
                value={editing ?? ""}
                onChange={(e) =>
                  ouvrir(
                    data.lieuxMunicipaux.find(
                      (p) => String(p.id) === e.target.value,
                    ),
                  )
                }
              >
                <option value="">Nouveau lieu</option>
                {data.lieuxMunicipaux.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </label>
            <form
              className="mt-5 grid max-w-xl gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                modifier();
              }}
            >
              <label>
                Nom
                <input {...champ("nom")} maxLength={160} />
              </label>
              <label>
                Catégorie
                <select {...champ("categorie")}>
                  {Object.entries(categories)
                    .filter(([k]) => k !== "logement")
                    .map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Latitude
                <input type="number" step="any" {...champ("latitude")} />
              </label>
              <label>
                Longitude
                <input type="number" step="any" {...champ("longitude")} />
              </label>
              <label>
                Source publique
                <input type="url" {...champ("sourceUrl")} />
              </label>
              <label>
                Accès
                <select {...champ("acces")}>
                  <option value="public">Public confirmé</option>
                  <option value="restreint">Restreint</option>
                  <option value="inconnu">À vérifier</option>
                </select>
              </label>
              <button disabled={busy} className="button-secondary">
                Enregistrer le lieu vérifié
              </button>
              {editing && (
                <button
                  type="button"
                  disabled={busy}
                  className="button-tertiary"
                  onClick={() => modifier(true)}
                >
                  Retirer ce lieu
                </button>
              )}
            </form>
          </details>
        </>
      )}
    </section>
  );
}
