import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import AdminTerritoire from "../components/territoire/AdminTerritoire.jsx";
import PageLayout from "../components/PageLayout.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { request } from "../services/api.js";
import { exportBaseDeDonnees } from "../services/exportApi.js";

export default function AdminPage() {
  const { utilisateur } = useAuth();
  const [listings, setListings] = useState([]);
  const [selection, setSelection] = useState("");
  const [motif, setMotif] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const listing = listings.find((item) => String(item.id) === selection);

  useEffect(() => {
    if (!utilisateur.estAdmin) return;
    const controller = new AbortController();
    request("/api/admin/logements", { signal: controller.signal })
      .then((data) => setListings(data.logements))
      .catch((err) => {
        if (!controller.signal.aborted) setError(err);
      });
    return () => controller.abort();
  }, [utilisateur.estAdmin]);

  async function moderate(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      const reason = listing.motif ? null : motif.trim();
      await request(`/api/admin/logements/${listing.id}/suspension`, {
        method: "PUT",
        body: JSON.stringify({ motif: reason }),
      });
      setListings((items) =>
        items.map((item) =>
          item.id === listing.id ? { ...item, motif: reason } : item,
        ),
      );
      setNotice(reason ? "Diffusion suspendue." : "Suspension levée.");
      setMotif("");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  if (!utilisateur.estAdmin) return <Navigate to="/compte" replace />;
  return (
    <PageLayout width="narrow">
      <h1 className="text-[32px] font-semibold">Administration municipale</h1>
      <ErrorMessage error={error} />
      <AdminTerritoire />
      <section className="my-8 border-y border-hairline-soft py-6">
        <h2 className="mb-4 text-xl font-semibold">Diffusion des annonces</h2>
        <form onSubmit={moderate} className="grid max-w-xl gap-4">
          <label>
            Logement
            <select
              className="form-control"
              value={selection}
              disabled={busy}
              onChange={(e) => {
                setSelection(e.target.value);
                setMotif("");
                setNotice("");
              }}
            >
              <option value="">Choisir une annonce</option>
              {listings.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.titre} · n° {item.id}
                  {item.motif ? " · suspendue" : ""}
                </option>
              ))}
            </select>
          </label>
          {listing && (
            <>
              {listing.motif ? (
                <p>Motif de suspension · {listing.motif}</p>
              ) : (
                <label>
                  Motif communiqué à l’hébergeur
                  <textarea
                    className="form-control"
                    required
                    maxLength={500}
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                  />
                </label>
              )}
              <button
                className="button-secondary justify-self-start"
                disabled={busy || (!listing.motif && !motif.trim())}
              >
                {listing.motif
                  ? "Lever la suspension"
                  : "Suspendre la diffusion"}
              </button>
            </>
          )}
          <p role="status">{notice}</p>
        </form>
      </section>
      <h2 className="mb-4 text-xl font-semibold">Documents de la plateforme</h2>
      <button
        className="button-secondary"
        onClick={() => exportBaseDeDonnees().catch(setError)}
      >
        Télécharger la base en XML
      </button>
      <a
        className="button-secondary ml-2"
        href="/api/export/factures.xml"
        download
      >
        Télécharger les factures en XML
      </a>
    </PageLayout>
  );
}
