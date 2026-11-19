/** Section de formulaire : intitulé à gauche, champs à droite (empilés sur mobile). */
export default function FormSection({ title, description, children, aside }) {
  return (
    <section className="grid gap-6 border-t border-hairline-soft py-10 first:border-t-0 first:pt-2 md:grid-cols-[260px_1fr] md:gap-12">
      <div>
        <div className="flex items-baseline justify-between gap-3 md:block">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          {aside && <p className="text-sm text-muted md:mt-1">{aside}</p>}
        </div>
        {description && <p className="mt-1 text-sm leading-5 text-muted">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
