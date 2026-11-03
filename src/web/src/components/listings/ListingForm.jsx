import { useEffect, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { Link } from "react-router";

import FormField from "../auth/FormField.jsx";
import ErrorMessage from "../ErrorMessage.jsx";
import FormSection from "./FormSection.jsx";
import { amenityIcon, listingTypes } from "../../data/listingTypes.js";
import { listEquipements } from "../../services/logementApi.js";

const MAX_GUESTS = 20;
const tileClass =
  "relative flex cursor-pointer rounded-sm border border-hairline bg-white transition-colors hover:border-ink has-checked:border-ink has-checked:bg-surface-soft has-checked:shadow-[inset_0_0_0_1px_var(--color-ink)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";

export default function ListingForm({ logement, onSave }) {
  const [form, setForm] = useState({
    titre: logement?.titre ?? "",
    description: logement?.description ?? "",
    typeLogement: logement?.typeLogement ?? "appartement",
    capacite: logement?.capacite ?? 2,
    prixNuit: logement ? logement.prixNuitCentimes / 100 : "",
    rue: logement?.adresse.rue ?? "",
    equipements: logement?.equipements.map(({ id }) => id) ?? [],
  });
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    listEquipements()
      .then((data) => {
        if (active) setEquipements(data.equipements);
      })
      .catch((err) => {
        if (active) setLoadError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function setGuests(delta) {
    setForm((current) => ({
      ...current,
      capacite: Math.min(MAX_GUESTS, Math.max(1, Number(current.capacite) + delta)),
    }));
  }

  function toggleAmenity(id, checked) {
    setForm((current) => ({
      ...current,
      equipements: checked
        ? [...current.equipements, id]
        : current.equipements.filter((item) => item !== id),
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        titre: form.titre,
        description: form.description,
        typeLogement: form.typeLogement,
        capacite: Number(form.capacite),
        prixNuitCentimes: Math.round(Number(form.prixNuit) * 100),
        adresse: { rue: form.rue, codePostal: "74220", ville: "La Clusaz" },
        equipements: form.equipements,
      });
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <fieldset disabled={saving} className="min-w-0">
        <FormSection
          title="Type de logement"
          description="Ce qui décrit le mieux votre logement."
        >
          <div role="radiogroup" aria-label="Type de logement" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {listingTypes.map(({ value, label, Icon }) => (
              <label key={value} className={`${tileClass} flex-col gap-3 p-4`}>
                <input
                  type="radio"
                  name="typeLogement"
                  value={value}
                  checked={form.typeLogement === value}
                  onChange={change}
                  className="sr-only"
                />
                <Icon aria-hidden="true" size={28} strokeWidth={1.5} />
                <span className="text-base font-medium text-ink">{label}</span>
              </label>
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Présentation"
          description="Un titre court et une description honnête donnent confiance aux voyageurs."
        >
          <div className="space-y-5">
            <FormField
              id="titre"
              label="Titre de l’annonce"
              name="titre"
              required
              minLength={3}
              maxLength={120}
              placeholder="Ex. Chalet calme avec terrasse"
              value={form.titre}
              onChange={change}
            />
            <div>
              <label className="field-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="form-control min-h-40 resize-y leading-6"
                name="description"
                required
                minLength={10}
                maxLength={2000}
                placeholder="Décrivez le logement, la fraîcheur des pièces, le quartier…"
                value={form.description}
                onChange={change}
              />
              <p className="mt-2 text-right text-xs text-muted">
                {form.description.length} / 2000
              </p>
            </div>
          </div>
        </FormSection>

        <FormSection title="Capacité et prix">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-hairline-soft pb-6">
              <div>
                <p id="capacite-label" className="text-base font-medium text-ink">Voyageurs</p>
                <p className="text-sm text-muted">Nombre maximum de personnes accueillies</p>
              </div>
              <div className="flex items-center gap-4" role="group" aria-labelledby="capacite-label">
                <button
                  type="button"
                  onClick={() => setGuests(-1)}
                  disabled={form.capacite <= 1}
                  aria-label="Retirer un voyageur"
                  className="grid size-8 place-items-center rounded-full border border-border-strong text-muted hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus aria-hidden="true" size={14} />
                </button>
                <output aria-live="polite" className="w-6 text-center text-base text-ink">
                  {form.capacite}
                </output>
                <button
                  type="button"
                  onClick={() => setGuests(1)}
                  disabled={form.capacite >= MAX_GUESTS}
                  aria-label="Ajouter un voyageur"
                  className="grid size-8 place-items-center rounded-full border border-border-strong text-muted hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus aria-hidden="true" size={14} />
                </button>
              </div>
            </div>

            <div className="max-w-xs">
              <label className="field-label" htmlFor="prixNuit">
                Prix par nuit
              </label>
              <div className="relative">
                <input
                  id="prixNuit"
                  name="prixNuit"
                  type="number"
                  inputMode="decimal"
                  required
                  min={0}
                  max={10000}
                  step="0.01"
                  placeholder="0"
                  value={form.prixNuit}
                  onChange={change}
                  className="form-control pr-12 text-lg font-semibold"
                />
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg font-semibold text-muted">
                  €
                </span>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Adresse"
          description="Les logements sont situés à La Clusaz."
        >
          <div className="space-y-5">
            <FormField
              id="rue"
              label="Rue et numéro"
              name="rue"
              required
              minLength={3}
              maxLength={160}
              autoComplete="address-line1"
              value={form.rue}
              onChange={change}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="codePostal" label="Code postal" value="74220" readOnly />
              <FormField id="ville" label="Ville" value="La Clusaz" readOnly />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Équipements"
          description="Indiquez ce qui est à disposition des voyageurs."
          aside={form.equipements.length ? `${form.equipements.length} sélectionné${form.equipements.length > 1 ? "s" : ""}` : null}
        >
          <ErrorMessage error={loadError} className="mb-4" />
          {loading && <p className="text-sm text-muted">Chargement des équipements…</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {equipements.map((item) => {
              const Icon = amenityIcon(item.nom);
              const checked = form.equipements.includes(item.id);
              return (
                <label key={item.id} className={`${tileClass} items-center gap-3 px-4 py-3.5`}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(event) => toggleAmenity(item.id, event.target.checked)}
                  />
                  <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                  <span className="flex-1 text-base text-ink">{item.nom}</span>
                  <span
                    aria-hidden="true"
                    className={`grid size-5 place-items-center rounded-[4px] border ${checked ? "border-ink bg-ink text-white" : "border-border-strong"}`}
                  >
                    {checked && <Check size={14} strokeWidth={3} />}
                  </span>
                </label>
              );
            })}
          </div>
        </FormSection>

        <div className="sticky bottom-16 z-10 -mx-6 border-t border-hairline-soft bg-white px-6 py-4 md:bottom-0 md:mx-0 md:px-0">
          <ErrorMessage error={error} className="mb-4" />
          <div className="flex items-center justify-between gap-3">
            <Link className="button-tertiary" to="/mes-logements">
              Annuler
            </Link>
            <button
              type="submit"
              className="button-primary"
              disabled={loading || Boolean(loadError) || saving}
            >
              {saving
                ? "Enregistrement…"
                : logement
                  ? "Enregistrer"
                  : "Publier et ajouter des photos"}
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
