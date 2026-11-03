function FormField({ label, id, hint, className = "", ...inputProps }) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input id={id} aria-describedby={hintId} className="form-control" {...inputProps} />
      {hint && (
        <p id={hintId} className="mt-2 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

export default FormField;
