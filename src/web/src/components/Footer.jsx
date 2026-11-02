import { Link } from "react-router";

import Brand from "./Brand.jsx";

function Footer() {
  return (
    <footer className="border-t border-hairline-soft bg-surface-soft">
      <div className="mx-auto grid w-full max-w-[1920px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] xl:px-12">
        <div>
          <Brand />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            Une plateforme locale pour trouver un logement temporaire au frais
            pendant les périodes de forte chaleur.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Découvrir</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>
              <Link className="hover:underline" to="/logements">
                Les logements
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Participer</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>
              <Link className="hover:underline" to="/publier">
                Proposer un logement
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-hairline px-5 py-5 text-center text-[13px] text-muted sm:px-8">
        © 2026 Refuge climatique · Projet universitaire
      </div>
    </footer>
  );
}

export default Footer;
