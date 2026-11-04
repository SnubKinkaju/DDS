import { useEffect, useRef, useState } from "react";
import { Download, LogOut, Menu, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { useAuth } from "../context/AuthContext.jsx";
import { accountLinks } from "../data/navigation.js";
import { exportBaseDeDonnees } from "../services/exportApi.js";
import { initials } from "../utils/format.js";

const itemClass =
  "flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-ink transition-colors hover:bg-surface-soft";

export default function AccountMenu() {
  const { utilisateur, chargement, deconnexion } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef(null);
  const button = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    function outside(event) {
      if (!ref.current?.contains(event.target)) setOpen(false);
    }
    function escape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  async function logout() {
    setBusy(true);
    setError("");
    try {
      await deconnexion();
      setOpen(false);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function exportDatabase() {
    setBusy(true);
    setError("");
    try {
      await exportBaseDeDonnees();
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="account-menu"
        aria-label={utilisateur ? "Menu de mon compte" : "Menu de connexion"}
        disabled={chargement}
        className={`flex h-12 items-center gap-3 rounded-full border border-hairline bg-white pr-1.5 pl-3.5 transition-shadow hover:shadow-floating ${open ? "shadow-floating" : ""}`}
      >
        <Menu aria-hidden="true" size={18} strokeWidth={2.4} />
        {utilisateur ? (
          <span className="grid size-8 place-items-center rounded-full bg-ink text-xs font-semibold text-white">
            {initials(utilisateur)}
          </span>
        ) : (
          <span className="grid size-8 place-items-center rounded-full bg-muted text-white">
            <UserRound aria-hidden="true" size={18} fill="currentColor" />
          </span>
        )}
      </button>

      {open && (
        <div
          id="account-menu"
          className="absolute top-[calc(100%+8px)] right-0 w-64 overflow-hidden rounded-md bg-white py-2 shadow-floating"
        >
          {!utilisateur ? (
            <>
              <Link to="/connexion" onClick={close} className={`${itemClass} font-semibold`}>
                Connexion
              </Link>
              <Link to="/inscription" onClick={close} className={itemClass}>
                Inscription
              </Link>
              <div className="my-2 hairline" />
              <Link to="/publier" onClick={close} className={itemClass}>
                Publier un logement
              </Link>
            </>
          ) : (
            <>
              <div className="px-4 pt-2 pb-3">
                <p className="text-sm font-semibold text-ink">
                  {utilisateur.prenom} {utilisateur.nom}
                </p>
                <p className="mt-0.5 truncate text-[13px] text-muted">
                  {utilisateur.email}
                </p>
              </div>
              <nav aria-label="Mon espace">
                {accountLinks.map((group) => (
                  <div key={group.label} className="border-t border-hairline-soft py-1">
                    {group.items.map(({ to, label, Icon, upcoming }) => (
                      <Link key={to} to={to} onClick={close} className={itemClass}>
                        <Icon aria-hidden="true" size={18} className="text-muted" />
                        <span className="flex-1">{label}</span>
                        {upcoming && (
                          <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[11px] font-semibold text-muted">
                            Bientôt
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
              <div className="border-t border-hairline-soft py-1">
                <button type="button" disabled={busy} onClick={exportDatabase} className={itemClass}>
                  <Download aria-hidden="true" size={18} className="text-muted" />
                  {busy ? "Export en cours…" : "Export BDD"}
                </button>
              </div>
              <div className="border-t border-hairline-soft pt-1">
                <button type="button" disabled={busy} onClick={logout} className={itemClass}>
                  <LogOut aria-hidden="true" size={18} className="text-muted" />
                  {busy ? "Déconnexion…" : "Se déconnecter"}
                </button>
              </div>
              {error && (
                <p role="alert" className="px-4 py-2 text-sm text-error">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
