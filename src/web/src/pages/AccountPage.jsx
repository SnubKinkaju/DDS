import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function AccountPage() {
  const { utilisateur } = useAuth();

  const informations = [
    ["Prénom", utilisateur.prenom],
    ["Nom", utilisateur.nom],
    ["Adresse email", utilisateur.email],
    ["Téléphone", utilisateur.telephone || "Non renseigné"],
    ["Type de compte", utilisateur.role === "proprietaire" ? "Propriétaire" : "Client"],
  ];

  return (
    <div className="min-h-screen bg-surface-soft">
      <Header />

      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-sm font-semibold text-primary">Espace personnel</p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.035em] text-ink">
          Mon compte
        </h1>

        <section className="mt-8 overflow-hidden rounded-[20px] border border-hairline-soft bg-white shadow-floating">
          <div className="border-b border-hairline-soft px-6 py-5 sm:px-8">
            <h2 className="text-lg font-semibold text-ink">Informations personnelles</h2>
          </div>
          <dl className="divide-y divide-hairline-soft px-6 sm:px-8">
            {informations.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-5 sm:grid-cols-[180px_1fr] sm:gap-6">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="text-sm font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default AccountPage;
