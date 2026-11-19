import { useEffect, useState } from "react";
import { request } from "../../services/api.js";
import FormField from "../auth/FormField.jsx";

export default function AdresseField({ rue, onChange }) {
  const [query, setQuery] = useState(null);
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!query || query !== rue || query.trim().length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      request(`/api/territoire/adresses?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then(({ adresses }) => setResult({ query, adresses }))
        .catch(() => {
          if (!controller.signal.aborted) setResult({ query, adresses: [] });
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, rue]);

  return (
    <div>
      <FormField
        id="rue"
        label="Rue et numéro"
        name="rue"
        required
        minLength={3}
        maxLength={160}
        autoComplete="off"
        value={rue}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          onChange(value, null);
        }}
      />
      {result &&
        result.query === query &&
        query === rue &&
        (result.adresses.length ? (
          <ul className="mt-2 rounded-sm border border-hairline">
            {result.adresses.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-surface-soft"
                  onClick={() => {
                    onChange(a.rue, a.id);
                    setQuery(null);
                  }}
                >
                  {a.rue} · La Clusaz
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Adresse non localisée. Vous pouvez poursuivre la saisie.
          </p>
        ))}
    </div>
  );
}
