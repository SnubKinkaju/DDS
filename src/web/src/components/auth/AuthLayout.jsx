import { X } from "lucide-react";
import { Link } from "react-router";

import Brand from "../Brand.jsx";

function AuthLayout({ title, heading, description, children, footer }) {
  return (
    <div className="min-h-screen bg-white md:bg-surface-soft">
      <header className="border-b border-hairline-soft bg-white">
        <div className="page-container flex h-16 items-center md:h-20">
          <Brand />
        </div>
      </header>

      <main className="md:px-6 md:py-14">
        <section className="mx-auto w-full max-w-[568px] bg-white md:rounded-lg md:shadow-floating">
          <div className="relative flex h-16 items-center justify-center border-b border-hairline-soft px-14">
            <Link to="/" className="icon-button absolute left-4" aria-label="Fermer et revenir à l’accueil">
              <X aria-hidden="true" size={18} />
            </Link>
            <p className="text-base font-bold text-ink">{title}</p>
          </div>

          <div className="p-6 md:p-8">
            <h1 className="text-[22px] font-semibold text-ink">{heading}</h1>
            {description && <p className="mt-2 text-base text-muted">{description}</p>}
            <div className="mt-6">{children}</div>
          </div>

          {footer && (
            <div className="border-t border-hairline-soft px-6 py-6 text-center text-sm text-muted md:px-8">
              {footer}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AuthLayout;
