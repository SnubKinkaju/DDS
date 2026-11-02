import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";

function PublishListingPage() {
  return (
    <div className="min-h-screen bg-surface-soft">
      <Header />

      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-sm font-semibold text-primary">Espace propriétaire</p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.035em] text-ink">
          Publier un logement
        </h1>
        <div className="mt-8 rounded-[20px] border border-hairline-soft bg-white px-6 py-12 text-center shadow-floating sm:px-10">
          <h2 className="text-lg font-semibold text-ink">Formulaire en préparation</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">
            Cette page accueillera le prochain parcours : création et publication
            d’un logement dans le catalogue.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PublishListingPage;
