import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export default function OwnerProfileDialog({ proprietaire, onClose }) {
  const dialogRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleLoad(event) {
    const document = event.currentTarget.contentDocument;
    setLoading(false);
    setError(!document?.querySelector('[typeof="Person"]'));
    // Le clavier dans l’iframe appartient à son propre document.
    document?.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dialogRef.current?.close();
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="owner-profile-title"
      onClose={(event) => {
        if (!event.currentTarget.open) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current.close();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-lg overflow-y-auto rounded-lg border-0 bg-white p-0 text-ink shadow-floating backdrop:bg-black/40"
    >
      <div>
        <header className="flex items-center justify-between border-b border-hairline-soft px-6 py-4">
          <h2 id="owner-profile-title" className="font-semibold">À propos du propriétaire</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Fermer le profil"
            onClick={() => dialogRef.current.close()}
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>
        {loading && <p role="status" className="px-6 pt-6 text-sm text-muted">Chargement du profil…</p>}
        {error && <p role="alert" className="p-6 text-sm text-muted">Impossible de charger ce profil. Fermez la fenêtre puis réessayez.</p>}
        <iframe
          src={`/api/utilisateurs/${proprietaire.id}/profil.html`}
          title={`Profil de ${proprietaire.prenom} ${proprietaire.nom}`}
          onLoad={handleLoad}
          hidden={error}
          className="h-[400px] w-full border-0"
        />
      </div>
    </dialog>
  );
}
