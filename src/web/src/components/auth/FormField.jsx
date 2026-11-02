function FormField({ label, id, hint, ...inputProps }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        id={id}
        className="mt-2 h-14 w-full rounded-lg border border-hairline bg-white px-4 text-base text-ink outline-none transition-colors placeholder:text-muted-soft focus:border-ink focus:ring-1 focus:ring-ink"
        {...inputProps}
      />
      {hint && <span className="mt-2 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export default FormField;
