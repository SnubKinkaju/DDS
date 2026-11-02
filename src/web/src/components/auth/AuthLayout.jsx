import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import Brand from "../Brand.jsx";

function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="border-b border-hairline-soft bg-white">
        <div className="mx-auto flex h-20 w-full max-w-[1920px] items-center justify-between px-5 sm:px-8 xl:px-12">
          <Brand />
          <Link
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
            to="/"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Retour à l’accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1920px] justify-center px-5 py-12 sm:px-8 sm:py-16 xl:px-12">
        <section className="w-full max-w-[520px] rounded-[20px] border border-hairline-soft bg-white p-6 shadow-floating sm:p-10">
          <div>
            <p className="text-sm font-semibold text-primary">Votre compte</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          </div>

          <div className="mt-8">{children}</div>

          {footer && (
            <div className="mt-8 border-t border-hairline-soft pt-6 text-center text-sm text-muted">
              {footer}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AuthLayout;
