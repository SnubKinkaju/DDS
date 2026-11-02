import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import ListingCard from "../components/ListingCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import listings from "../data/listings.js";
import { Link } from "react-router";

function HomePage() {
  return (
    <div id="top" className="min-h-screen bg-white">
      <Header />

      <main>
        <section className="mx-auto w-full max-w-[1920px] px-5 pt-10 sm:px-8 sm:pt-14 xl:px-12">
          <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold text-primary">
                La Clusaz · Haute-Savoie
              </p>
              <h1 className="mt-3 max-w-3xl text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.03] font-semibold tracking-[-0.04em] text-ink">
                Un refuge au frais quand la ville surchauffe.
              </h1>
            </div>
            <p className="max-w-xl text-base leading-7 text-muted lg:justify-self-end lg:pb-2">
              Trouvez un logement temporaire en montagne pour traverser les
              périodes de forte chaleur plus sereinement.
            </p>
          </div>

          <div className="relative z-10 mx-auto mt-8 max-w-5xl lg:-mb-8">
            <SearchBar />
          </div>

          <div className="relative mt-6 h-[420px] overflow-hidden rounded-[24px] bg-surface-strong sm:h-[520px] lg:mt-0">
            <img
              className="h-full w-full object-cover"
              src="/images/refuge-hero.jpg"
              alt="Maison lumineuse entourée de grands arbres"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/5 to-transparent" />
            <div className="absolute right-0 bottom-0 left-0 p-6 text-white sm:p-10">
              <p className="text-sm font-semibold">Séjourner autrement</p>
              <p className="mt-2 max-w-lg text-xl leading-7 font-medium sm:text-2xl">
                Une solution locale et temporaire pour retrouver des nuits
                plus fraîches.
              </p>
            </div>
          </div>
        </section>

        <section
          id="logements"
          className="mx-auto w-full max-w-[1920px] scroll-mt-24 px-5 py-16 sm:px-8 xl:px-12"
        >
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-primary">À découvrir</p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink">
                Logements à La Clusaz
              </h2>
              <p className="mt-2 text-sm text-muted">
                Données de démonstration de la future plateforme.
              </p>
            </div>
            <Link
              className="hidden text-sm font-medium text-ink underline underline-offset-4 sm:block"
              to="/logements"
            >
              Voir le catalogue
            </Link>
          </div>

          <div className="mt-8 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        <section
          id="publier"
          className="mx-auto w-full max-w-[1920px] scroll-mt-24 px-5 py-16 sm:px-8 xl:px-12"
        >
          <div className="flex flex-col items-start justify-between gap-8 rounded-[24px] bg-ink px-7 py-10 text-white sm:px-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-white/70">
                Vous avez une chambre disponible ?
              </p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">
                Proposez un logement-refuge.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Le formulaire de publication sera la prochaine fonctionnalité
                connectée à Flask.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white">
              Fonctionnalité à venir
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;
