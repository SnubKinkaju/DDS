import { House, Map, PlusCircle, Search, UserRound } from "lucide-react";
import { NavLink, useLocation } from "react-router";

import { useAuth } from "../context/AuthContext.jsx";

/** Barre d’onglets fixée en bas de l’écran sur mobile (< 768px). */
export default function MobileNav() {
  const { pathname } = useLocation();
  const { utilisateur } = useAuth();

  const items = [
    { to: "/", label: "Accueil", Icon: House, active: pathname === "/" },
    {
      to: "/logements",
      label: "Logements",
      Icon: Search,
      active: pathname === "/logements" || pathname.startsWith("/logements/"),
    },
    { to: "/carte", label: "Carte", Icon: Map, active: pathname === "/carte" },
    {
      to: "/publier",
      label: "Publier",
      Icon: PlusCircle,
      active: pathname === "/publier",
    },
    utilisateur
      ? {
          to: "/compte",
          label: "Profil",
          Icon: UserRound,
          active:
            pathname === "/compte" ||
            pathname.startsWith("/mes-logements") ||
            ["/reservations", "/favoris", "/messages"].includes(pathname),
        }
      : {
          to: "/connexion",
          label: "Connexion",
          Icon: UserRound,
          active: false,
        },
  ];

  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline-soft bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {items.map(({ to, label, Icon, active }) => (
          <li key={label}>
            <NavLink
              to={to}
              end={to === "/"}
              aria-current={active ? "page" : undefined}
              className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-primary" : "text-muted"}`}
            >
              <Icon aria-hidden="true" size={24} strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
