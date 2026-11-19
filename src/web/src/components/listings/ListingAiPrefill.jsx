import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import ErrorMessage from "../ErrorMessage.jsx";
import { prefillLogement } from "../../services/logementApi.js";

export default function ListingAiPrefill({ disabled, onApply, onBusyChange }) {
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const requestRef = useRef(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  async function submit(event) {
    event.preventDefault();
    if (busy || disabled) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true);
    onBusyChange(true);
    setError(null);
    setNotice("");
    try {
      const { proposition } = await prefillLogement(
        description.trim(),
        controller.signal,
      );
      if (controller.signal.aborted) return;
      const count = onApply(proposition);
      setNotice(
        count
          ? "Formulaire prérempli. Vérifiez les informations et complétez les champs manquants avant de publier."
          : "Aucune information à préremplir. Précisez le type de logement, la capacité, le prix ou les équipements.",
      );
    } catch (err) {
      if (!controller.signal.aborted) setError(err);
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false);
        onBusyChange(false);
      }
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-10 rounded-md border border-hairline-soft bg-surface-soft p-5 sm:p-6"
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-white text-primary">
          <Sparkles size={20} aria-hidden="true" />
        </span>
        <div>
          <label
            htmlFor="description-ia"
            className="block text-base font-semibold"
          >
            Décrivez votre logement
          </label>
          <p id="description-ia-help" className="mt-1 text-sm text-muted">
            Écrivez librement, l’IA vous aide à remplir le formulaire.
          </p>
        </div>
      </div>
      <textarea
        id="description-ia"
        aria-describedby="description-ia-help description-ia-note"
        value={description}
        onChange={(event) => {
          setDescription(event.target.value);
          setNotice("");
        }}
        disabled={disabled || busy}
        required
        minLength={10}
        maxLength={5000}
        rows={4}
        className="form-control resize-y text-sm leading-6 disabled:opacity-60"
        placeholder="Ex. Je propose un chalet pour 4 personnes à La Clusaz, à 80 € par nuit, avec une cuisine équipée et un jardin."
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p
          id="description-ia-note"
          className="max-w-md text-xs leading-5 text-muted"
        >
          Les informations absentes restent à compléter. Les champs trouvés sont
          actualisés, les autres sont conservés. Rien n’est publié à cette
          étape.
        </p>
        <button
          type="submit"
          disabled={disabled || busy || description.trim().length < 10}
          className="button-primary button-small"
        >
          {busy ? (
            <LoaderCircle
              size={16}
              aria-hidden="true"
              className="motion-safe:animate-spin"
            />
          ) : (
            <Sparkles size={16} aria-hidden="true" />
          )}
          {busy ? "Préremplissage…" : "Préremplir avec l'IA"}
        </button>
      </div>
      {busy && (
        <p role="status" className="mt-4 text-sm text-muted">
          Analyse de votre description en cours…
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 text-sm leading-6 text-ink">
          {notice}
        </p>
      )}
      <ErrorMessage error={error} className="mt-4 bg-white" />
    </form>
  );
}
