import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, Grid2x2, ImageIcon } from "lucide-react";

/** Répartition des vignettes à droite de la photo principale (grille 4×2). */
const layouts = {
  1: ["col-span-2 row-span-2"],
  2: ["col-span-2", "col-span-2"],
  3: ["col-span-2", "", ""],
  4: ["", "", "", ""],
};

export default function PhotoGallery({ photos, title }) {
  const [viewer, setViewer] = useState(null);
  const [current, setCurrent] = useState(0);
  const closeViewer = useCallback(() => setViewer(null), []);

  if (!photos.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg bg-surface-soft text-muted">
        <ImageIcon aria-hidden="true" size={32} strokeWidth={1.5} />
        <p className="text-sm">Le propriétaire n’a pas encore ajouté de photo.</p>
      </div>
    );
  }

  const [cover, ...others] = photos;
  const side = others.slice(0, 4);

  function onScroll(event) {
    const { scrollLeft, clientWidth } = event.currentTarget;
    setCurrent(Math.round(scrollLeft / clientWidth));
  }

  return (
    <section aria-label="Photos du logement">
      {/* Mobile : carrousel plein écran */}
      <div className="relative -mx-6 md:hidden">
        <div
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        >
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setViewer(index)}
              className="aspect-[4/3] w-full shrink-0 snap-center"
              aria-label={`Agrandir la photo ${index + 1}`}
            >
              <img className="size-full object-cover" src={photo.url} alt="" />
            </button>
          ))}
        </div>
        {photos.length > 1 && (
          <span className="absolute right-4 bottom-4 rounded-sm bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
            {current + 1} / {photos.length}
          </span>
        )}
      </div>

      {/* Desktop : mosaïque */}
      <div className="relative hidden md:block">
        <div
          className={`grid h-[min(460px,40vw)] gap-2 overflow-hidden rounded-lg ${side.length ? "grid-cols-4 grid-rows-2" : "grid-cols-1"}`}
        >
          <Tile
            photo={cover}
            onClick={() => setViewer(0)}
            label={`${title} — photo 1`}
            className={side.length ? "col-span-2 row-span-2" : ""}
          />
          {side.map((photo, index) => (
            <Tile
              key={photo.id}
              photo={photo}
              onClick={() => setViewer(index + 1)}
              label={`${title} — photo ${index + 2}`}
              className={layouts[side.length][index]}
            />
          ))}
        </div>
        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => setViewer(0)}
            className="absolute right-6 bottom-6 flex items-center gap-2 rounded-sm border border-ink bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-soft"
          >
            <Grid2x2 aria-hidden="true" size={16} />
            Afficher les {photos.length} photos
          </button>
        )}
      </div>

      {viewer !== null && (
        <PhotoViewer photos={photos} title={title} start={viewer} onClose={closeViewer} />
      )}
    </section>
  );
}

function Tile({ photo, onClick, label, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Agrandir : ${label}`}
      className={`group relative min-h-0 overflow-hidden bg-surface-strong ${className}`}
    >
      <img
        className="size-full object-cover transition-[filter] group-hover:brightness-90"
        src={photo.url}
        alt=""
      />
    </button>
  );
}

function PhotoViewer({ photos, title, start, onClose }) {
  const refs = useRef([]);
  const closeButton = useRef(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    refs.current[start]?.scrollIntoView({ block: "start" });
    function escape(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [start, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photos — ${title}`}
      className="fixed inset-0 z-50 overflow-y-auto bg-white"
    >
      <div className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-hairline-soft bg-white px-4 md:px-10">
        <button ref={closeButton} type="button" onClick={onClose} className="icon-button" aria-label="Fermer">
          <ChevronLeft aria-hidden="true" size={20} />
        </button>
        <p className="truncate text-sm font-semibold">{title}</p>
      </div>
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-6 md:py-10">
        {photos.map((photo, index) => (
          <img
            key={photo.id}
            ref={(node) => (refs.current[index] = node)}
            src={photo.url}
            alt={`${title} — photo ${index + 1}`}
            className="w-full scroll-mt-20 rounded-sm bg-surface-soft"
          />
        ))}
      </div>
    </div>
  );
}
