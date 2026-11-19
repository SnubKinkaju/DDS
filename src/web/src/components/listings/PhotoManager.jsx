import { useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";

import { deletePhoto, uploadPhoto } from "../../services/logementApi.js";
import ErrorMessage from "../ErrorMessage.jsx";
import FormSection from "./FormSection.jsx";

const MAX_PHOTOS = 8;

export default function PhotoManager({ logement, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const full = logement.photos.length >= MAX_PHOTOS;

  async function upload(event) {
    const files = Array.from(event.target.files);
    event.target.value = "";
    if (!files.length) return;
    setError(null);
    if (files.length + logement.photos.length > MAX_PHOTOS) {
      setError(`Vous pouvez ajouter au maximum ${MAX_PHOTOS} photos.`);
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setError("Chaque photo doit faire moins de 5 Mo.");
      return;
    }
    setBusy(true);
    try {
      for (const file of files) {
        const response = await uploadPhoto(logement.id, file);
        onChange(response.logement);
      }
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function remove(photo) {
    if (!window.confirm("Supprimer cette photo ?")) return;
    setBusy(true);
    setError(null);
    try {
      onChange((await deletePhoto(logement.id, photo.id)).logement);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormSection
      title="Photos"
      aside={`${logement.photos.length} / ${MAX_PHOTOS}`}
      description="La première photo sert de couverture. JPEG, PNG ou WebP, 5 Mo maximum. Les changements sont enregistrés immédiatement."
    >
      <ErrorMessage error={error} className="mb-4" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {logement.photos.map((photo, index) => (
          <div
            key={photo.id}
            className={`relative overflow-hidden rounded-sm bg-surface-strong ${index === 0 ? "col-span-2 aspect-[2/1] sm:col-span-2" : "aspect-square"}`}
          >
            <img className="size-full object-cover" src={photo.url} alt={`Photo ${index + 1} du logement`} />
            {index === 0 && <span className="photo-badge absolute top-3 left-3">Couverture</span>}
            <button
              type="button"
              onClick={() => remove(photo)}
              disabled={busy}
              className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-white/95 text-ink shadow-floating transition-colors hover:bg-white disabled:opacity-50"
              aria-label={`Supprimer la photo ${index + 1}`}
            >
              <Trash2 aria-hidden="true" size={16} />
            </button>
          </div>
        ))}

        {!full && (
          <label
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border-strong p-4 text-center transition-colors hover:border-ink hover:bg-surface-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink ${logement.photos.length === 0 ? "col-span-2 aspect-[2/1] sm:col-span-3 sm:aspect-[3/1]" : "aspect-square"} ${busy ? "pointer-events-none opacity-60" : ""}`}
          >
            {busy ? (
              <LoaderCircle aria-hidden="true" size={28} className="animate-spin text-muted" />
            ) : (
              <ImagePlus aria-hidden="true" size={28} strokeWidth={1.5} className="text-ink" />
            )}
            <span className="text-sm font-semibold text-ink">
              {busy ? "Envoi en cours…" : "Ajouter des photos"}
            </span>
            <input
              className="sr-only"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={upload}
              disabled={busy}
            />
          </label>
        )}
      </div>
    </FormSection>
  );
}
