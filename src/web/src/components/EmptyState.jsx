export default function EmptyState({ Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-hairline-soft px-6 py-16 text-center">
      {Icon && (
        <span className="grid size-14 place-items-center rounded-full bg-surface-strong text-ink">
          <Icon aria-hidden="true" size={26} strokeWidth={1.75} />
        </span>
      )}
      <h2 className="mt-5 text-xl font-semibold text-ink">{title}</h2>
      {children && <p className="mt-2 max-w-md text-base text-muted">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
