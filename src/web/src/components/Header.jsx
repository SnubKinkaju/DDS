import { Map, Search } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router";

import AccountMenu from "./AccountMenu.jsx";
import Brand from "./Brand.jsx";

const tabs = [
  {
    to: "/logements",
    label: "Logements",
    Icon: Search,
    match: (path) => path === "/" || path.startsWith("/logements"),
  },
  {
    to: "/carte",
    label: "Carte",
    Icon: Map,
    match: (path) => path.startsWith("/carte"),
  },
];

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline-soft bg-white">
      <div className="page-container grid h-16 grid-cols-[1fr_auto] items-center gap-4 md:h-20 md:grid-cols-[1fr_auto_1fr]">
        <Brand />

        <nav
          aria-label="Navigation principale"
          className="hidden h-full items-stretch gap-8 md:flex"
        >
          {tabs.map(({ to, label, Icon, match }) => {
            const active = match(pathname);
            return (
              <NavLink
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-2 px-1 text-base font-semibold transition-colors ${active ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={2.2} />
                {label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-3 h-0.5 rounded-full transition-colors ${active ? "bg-ink" : "bg-transparent group-hover:bg-hairline"}`}
                />
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link
            to="/publier"
            className="hidden rounded-full px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft md:block"
          >
            Publier un logement
          </Link>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
