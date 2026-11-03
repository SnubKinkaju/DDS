import { Link } from "react-router";

const columns = [
  {
    title: "Découvrir",
    links: [
      { to: "/logements", label: "Tous les logements" },
      { to: "/carte", label: "Carte des logements" },
    ],
  },
  {
    title: "Héberger",
    links: [
      { to: "/publier", label: "Publier un logement" },
      { to: "/mes-logements", label: "Gérer mes logements" },
    ],
  },
  {
    title: "Votre compte",
    links: [
      { to: "/compte", label: "Mon compte" },
      { to: "/reservations", label: "Mes réservations" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-hairline-soft bg-surface-soft">
      <div className="page-container">
        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-3 sm:gap-6 md:py-12">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-semibold text-ink">{column.title}</h2>
              <ul className="mt-3 space-y-3">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1 border-t border-hairline py-6 text-[13px] text-muted sm:flex-row sm:justify-between">
          <p>© 2026 Refuge climatique · La Clusaz</p>
          <p>Projet universitaire · Documents et données structurées</p>
        </div>
      </div>
    </footer>
  );
}
