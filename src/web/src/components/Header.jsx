import {
  ChevronDown,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";

import { useAuth } from "../context/AuthContext.jsx";
import Brand from "./Brand.jsx";

function Header() {
  const navigate = useNavigate();
  const accountMenuRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const { utilisateur, chargement, deconnexion } = useAuth();

  useEffect(() => {
    function closeAccountMenu(event) {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setAccountMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeAccountMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeAccountMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function handleLogout() {
    setLogoutPending(true);
    try {
      await deconnexion();
      setAccountMenuOpen(false);
      setMobileMenuOpen(false);
      navigate("/");
    } finally {
      setLogoutPending(false);
    }
  }

  const initials = utilisateur
    ? `${utilisateur.prenom[0] ?? ""}${utilisateur.nom[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-50 border-b border-hairline-soft bg-white/95 backdrop-blur">
      <div className="mx-auto grid h-20 w-full max-w-[1920px] grid-cols-[1fr_auto] items-center gap-4 px-5 sm:px-8 md:grid-cols-[1fr_auto_1fr] xl:px-12">
        <div className="justify-self-start">
          <Brand />
        </div>

        <nav
          className="hidden h-full items-center md:flex"
          aria-label="Navigation principale"
        >
          <NavLink
            className={({ isActive }) =>
              `relative flex h-full items-center px-5 text-sm font-medium transition-colors ${
                isActive
                  ? "text-ink after:absolute after:right-5 after:bottom-0 after:left-5 after:h-0.5 after:bg-ink"
                  : "text-muted hover:text-ink"
              }`
            }
            to="/logements"
          >
            Catalogue
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            className="hidden rounded-lg px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-soft lg:block"
            to="/publier"
          >
            Publier un logement
          </Link>

          {!chargement && utilisateur && (
            <div ref={accountMenuRef} className="relative hidden md:block">
              <button
                className="flex h-11 items-center gap-2 rounded-full border border-hairline bg-white py-1 pr-3 pl-1.5 text-sm font-medium text-ink transition-shadow hover:shadow-floating"
                type="button"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                onClick={() => setAccountMenuOpen((open) => !open)}
              >
                <span className="grid size-8 place-items-center rounded-full bg-ink text-xs font-semibold text-white">
                  {initials}
                </span>
                <span className="max-w-28 truncate">{utilisateur.prenom}</span>
                <ChevronDown
                  className={`transition-transform ${accountMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                  size={16}
                />
              </button>

              {accountMenuOpen && (
                <div
                  className="absolute top-[calc(100%+12px)] right-0 w-72 overflow-hidden rounded-2xl border border-hairline-soft bg-white p-2 shadow-floating"
                  role="menu"
                >
                  <div className="px-3 py-3">
                    <p className="font-semibold text-ink">
                      {utilisateur.prenom} {utilisateur.nom}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted">
                      {utilisateur.email}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-surface-strong px-2.5 py-1 text-[11px] font-semibold text-muted">
                      {utilisateur.role === "proprietaire" ? "Propriétaire" : "Client"}
                    </span>
                  </div>

                  <div className="border-t border-hairline-soft py-2">
                    <Link
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-body hover:bg-surface-soft hover:text-ink"
                      to="/compte"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <UserRound aria-hidden="true" size={18} />
                      Mon compte
                    </Link>
                    <button
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-body hover:bg-surface-soft hover:text-ink disabled:opacity-50"
                      type="button"
                      role="menuitem"
                      disabled={logoutPending}
                      onClick={handleLogout}
                    >
                      <LogOut aria-hidden="true" size={18} />
                      {logoutPending ? "Déconnexion…" : "Se déconnecter"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!chargement && !utilisateur && (
            <Link
              className="hidden rounded-full border border-hairline px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-soft md:block"
              to="/connexion"
            >
              Se connecter
            </Link>
          )}

          <button
            className="grid size-11 place-items-center rounded-full border border-hairline bg-white text-ink md:hidden"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <X aria-hidden="true" size={20} />
            ) : (
              <Menu aria-hidden="true" size={20} />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          className="border-t border-hairline-soft bg-white px-5 py-4 md:hidden"
          aria-label="Navigation mobile"
        >
          <div className="mx-auto flex w-full max-w-[1920px] flex-col">
            <Link
              className="border-b border-hairline-soft py-4 text-base font-medium"
              to="/logements"
              onClick={() => setMobileMenuOpen(false)}
            >
              Catalogue
            </Link>
            <Link
              className="border-b border-hairline-soft py-4 text-base font-medium"
              to="/publier"
              onClick={() => setMobileMenuOpen(false)}
            >
              Publier un logement
            </Link>

            {!chargement && utilisateur && (
              <div className="pt-4">
                <div className="flex items-center gap-3 px-1 pb-4">
                  <span className="grid size-10 place-items-center rounded-full bg-ink text-xs font-semibold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {utilisateur.prenom} {utilisateur.nom}
                    </p>
                    <p className="truncate text-sm text-muted">{utilisateur.email}</p>
                  </div>
                </div>
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-surface-soft"
                  to="/compte"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserRound aria-hidden="true" size={18} />
                  Mon compte
                </Link>
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-surface-soft"
                  type="button"
                  disabled={logoutPending}
                  onClick={handleLogout}
                >
                  <LogOut aria-hidden="true" size={18} />
                  Se déconnecter
                </button>
              </div>
            )}

            {!chargement && !utilisateur && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  className="rounded-lg border border-hairline px-4 py-3 text-center text-sm font-semibold"
                  to="/connexion"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  className="rounded-lg bg-ink px-4 py-3 text-center text-sm font-semibold text-white"
                  to="/inscription"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;
