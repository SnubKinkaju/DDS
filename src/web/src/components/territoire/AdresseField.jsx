import { useEffect, useId, useRef, useState } from "react";
import { CircleCheck, LoaderCircle, MapPin, Signpost } from "lucide-react";

import { request } from "../../services/api.js";

const MESSAGE_INVALIDE = "Choisissez une adresse de La Clusaz dans la liste.";

/**
 * Champ d'adresse limité au référentiel BAN de La Clusaz.
 * La saisie est libre, mais seule une adresse choisie dans la liste est valide :
 * sans identifiant, le navigateur bloque l'envoi du formulaire.
 */
export default function AdresseField({ rue, adresseIgn, onChange }) {
  const listId = useId();
  const input = useRef(null);
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [active, setActive] = useState(-1);
  const [result, setResult] = useState(null);

  const query = rue.trim();
  const searching = open && !adresseIgn && query.length > 0;
  const current = result?.query === query ? result : null;
  const options = current
    ? [
        ...current.voies.map((voie) => ({ kind: "voie", key: voie.nom, ...voie })),
        ...current.adresses.map((adresse) => ({ kind: "adresse", key: adresse.id, ...adresse })),
      ]
    : [];

  useEffect(() => {
    input.current?.setCustomValidity(adresseIgn ? "" : MESSAGE_INVALIDE);
  }, [adresseIgn]);

  useEffect(() => {
    if (!searching) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      request(`/api/territoire/adresses?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then(({ voies, adresses }) => setResult({ query, voies, adresses }))
        .catch(() => {
          if (!controller.signal.aborted)
            setResult({ query, voies: [], adresses: [], erreur: true });
        });
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searching, query]);

  function choose(option) {
    if (option.kind === "voie") {
      // On garde la liste ouverte : elle affiche maintenant les numéros de la voie.
      onChange(`${option.nom} `, null);
      setActive(-1);
      input.current?.focus();
      return;
    }
    onChange(option.rue, option.id);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!options.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) => (index + step + options.length) % options.length);
    } else if (event.key === "Enter" && open && active >= 0) {
      event.preventDefault();
      choose(options[active]);
    }
  }

  const showList = searching && current && options.length > 0;
  const status = !searching
    ? null
    : !current
      ? "loading"
      : current.erreur
        ? "erreur"
        : options.length === 0
          ? "vide"
          : null;
  const invalid = touched && !adresseIgn && !open;

  return (
    <div className="relative">
      <label className="field-label" htmlFor="rue">
        Numéro et voie
      </label>
      <div className="relative">
        <MapPin
          aria-hidden="true"
          size={18}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
        />
        <input
          ref={input}
          id="rue"
          name="rue"
          type="text"
          role="combobox"
          aria-expanded={Boolean(showList)}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          aria-describedby="rue-aide"
          aria-invalid={invalid || undefined}
          autoComplete="off"
          required
          maxLength={160}
          placeholder="Ex. 164 route du Col des Aravis"
          className={`form-control pr-11 pl-11 ${invalid ? "border-error" : ""}`}
          value={rue}
          onChange={(event) => {
            onChange(event.target.value, null);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setOpen(false);
            setTouched(true);
          }}
          onKeyDown={onKeyDown}
        />
        {status === "loading" && (
          <LoaderCircle
            aria-hidden="true"
            size={18}
            className="absolute top-1/2 right-4 -translate-y-1/2 animate-spin text-muted"
          />
        )}
        {adresseIgn && (
          <CircleCheck
            aria-hidden="true"
            size={20}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-success"
          />
        )}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Adresses de La Clusaz"
          className="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-md bg-white py-2 shadow-floating"
        >
          {options.map((option, index) => (
            <li
              key={option.key}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              // mousedown : choisir avant que le champ perde le focus.
              onMouseDown={(event) => {
                event.preventDefault();
                choose(option);
              }}
              onMouseEnter={() => setActive(index)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${index === active ? "bg-surface-soft" : ""}`}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-surface-strong text-ink">
                {option.kind === "voie" ? (
                  <Signpost aria-hidden="true" size={18} />
                ) : (
                  <MapPin aria-hidden="true" size={18} />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base text-ink">
                  {option.kind === "voie" ? option.nom : option.rue}
                </span>
                <span className="block text-sm text-muted">
                  {option.kind === "voie"
                    ? `Voie · ${option.adresses} adresse${option.adresses > 1 ? "s" : ""}`
                    : "74220 La Clusaz"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p
        id="rue-aide"
        aria-live="polite"
        className={`mt-2 text-sm ${invalid || status === "erreur" ? "text-error" : adresseIgn ? "text-success" : "text-muted"}`}
      >
        {adresseIgn
          ? "Adresse vérifiée dans la Base Adresse Nationale."
          : status === "erreur"
            ? "Recherche indisponible pour le moment. Réessayez."
            : status === "vide"
              ? "Aucune adresse de La Clusaz ne correspond à cette saisie."
              : invalid
                ? MESSAGE_INVALIDE
                : "Tapez un numéro ou un nom de voie, puis choisissez l’adresse dans la liste."}
      </p>
    </div>
  );
}
