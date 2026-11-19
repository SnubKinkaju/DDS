import { useState } from "react";
import { ChevronRight, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router";

import ErrorMessage from "../components/ErrorMessage.jsx";
import PageLayout from "../components/PageLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { accountLinks } from "../data/navigation.js";
import { initials } from "../utils/format.js";

function AccountPage() {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const roleLabel = utilisateur.role === "proprietaire" ? "Propriétaire" : "Voyageur";
  const informations = [
    ["Prénom", utilisateur.prenom],
    ["Nom", utilisateur.nom],
    ["Adresse email", utilisateur.email],
    ["Téléphone", utilisateur.telephone || "Non renseigné"],
    ["Type de compte", roleLabel],
  ];
  const shortcuts = accountLinks
    .flatMap((group) => group.items)
    .filter((item) => item.to !== "/compte");

  async function logout() {
    setBusy(true);
    setError("");
    try {
      await deconnexion();
      navigate("/");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <PageLayout width="narrow">
      <h1 className="text-[32px] font-semibold text-ink">Mon compte</h1>

      <div className="mt-8 grid items-start gap-10 md:grid-cols-[300px_1fr] md:gap-16">
        <section
          aria-label="Profil"
          className="flex flex-col items-center rounded-lg p-8 text-center shadow-floating md:sticky md:top-28"
        >
          <span className="grid size-24 place-items-center rounded-full bg-ink text-3xl font-semibold text-white">
            {initials(utilisateur)}
          </span>
          <p className="mt-4 text-[26px] leading-tight font-semibold text-ink">
            {utilisateur.prenom}
          </p>
          <p className="mt-1 text-sm font-medium text-muted">{roleLabel}</p>
        </section>

        <div className="min-w-0">
          <section aria-labelledby="infos-title">
            <h2 id="infos-title" className="text-[22px] font-semibold text-ink">
              Informations personnelles
            </h2>
            <dl className="mt-4 divide-y divide-hairline-soft">
              {informations.map(([label, value]) => (
                <div key={label} className="py-4">
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="mt-0.5 text-base break-words text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="space-title" className="mt-10">
            <h2 id="space-title" className="text-[22px] font-semibold text-ink">
              Mon espace
            </h2>
            <ul className="mt-4 divide-y divide-hairline-soft border-y border-hairline-soft">
              {shortcuts.map(({ to, label, Icon, upcoming }) => (
                <li key={to}>
                  <Link to={to} className="flex items-center gap-4 py-4 text-base text-ink hover:underline">
                    <Icon aria-hidden="true" size={22} strokeWidth={1.6} />
                    <span className="flex-1">{label}</span>
                    {upcoming && (
                      <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[11px] font-semibold text-muted">
                        Bientôt
                      </span>
                    )}
                    <ChevronRight aria-hidden="true" size={18} className="text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <ErrorMessage error={error} />
          <button
            type="button"
            onClick={logout}
            disabled={busy}
            className="button-tertiary mt-8"
          >
            <LogOut aria-hidden="true" size={16} />
            {busy ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}

export default AccountPage;
