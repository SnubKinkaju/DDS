import { useEffect, useId, useRef, useState } from "react";
import {
  Braces,
  Download,
  FileText,
  LoaderCircle,
  Printer,
  ReceiptText,
  X,
} from "lucide-react";
import {
  downloadDocument,
  getFactureDocument,
} from "../../services/factureApi.js";

const tabs = [
  { format: "html", label: "Imprimable", Icon: ReceiptText },
  { format: "json", label: "JSON", Icon: Braces },
  { format: "txt", label: "Texte", Icon: FileText },
];

export default function InvoicePreviewDialog({ facture, onClose }) {
  const dialogRef = useRef(null);
  const frameRef = useRef(null);
  const id = useId();
  const [format, setFormat] = useState("html");
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [printReady, setPrintReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setContent(null);
    setError("");
    setPrintReady(false);
    getFactureDocument(facture.numero, format, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setContent(value);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      });
    return () => controller.abort();
  }, [facture.numero, format, retry]);

  function selectTab(index) {
    if (tabs[index].format !== format) {
      setContent(null);
      setPrintReady(false);
      setDownloadError("");
      setFormat(tabs[index].format);
    }
    document.getElementById(`${id}-${tabs[index].format}`)?.focus();
  }

  function moveTab(event, index) {
    const next = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[event.key];
    if (next !== undefined) {
      event.preventDefault();
      selectTab(next);
    }
  }

  function frameLoaded(event) {
    const frameDocument = event.currentTarget.contentDocument;
    setPrintReady(Boolean(frameDocument?.querySelector(".facture")));
    frameDocument?.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dialogRef.current?.close();
      }
    });
  }

  async function downloadXml() {
    setDownloading(true);
    setDownloadError("");
    try {
      const xml = await getFactureDocument(facture.numero, "xml");
      downloadDocument(facture.numero, "xml", xml);
    } catch (err) {
      setDownloadError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onClose={(event) => {
        if (!event.currentTarget.open) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current.close();
      }}
      className="fixed inset-0 m-auto h-[92dvh] max-h-[1000px] w-[calc(100%-24px)] max-w-5xl overflow-hidden rounded-lg border-0 bg-white p-0 text-ink shadow-floating backdrop:bg-black/45 sm:w-[calc(100%-64px)]"
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden size-11 shrink-0 place-items-center rounded-md bg-primary/10 text-primary sm:grid">
              <ReceiptText size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 id={`${id}-title`} className="text-lg font-semibold">
                Votre facture
              </h2>
              <p className="text-xs text-muted sm:text-sm">{facture.numero}</p>
            </div>
          </div>
          <button
            autoFocus
            type="button"
            className="icon-button shrink-0"
            aria-label="Fermer la facture"
            onClick={() => dialogRef.current.close()}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div
          role="tablist"
          aria-label="Format de la facture"
          className="flex shrink-0 gap-2 border-b border-hairline-soft px-4 sm:gap-6 sm:px-6"
        >
          {tabs.map(({ format: value, label, Icon }, index) => (
            <button
              key={value}
              type="button"
              role="tab"
              id={`${id}-${value}`}
              aria-controls={`${id}-panel`}
              aria-selected={format === value}
              tabIndex={format === value ? 0 : -1}
              onClick={() => {
                if (format !== value) selectTab(index);
              }}
              onKeyDown={(event) => moveTab(event, index)}
              className={`flex items-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold transition-colors ${format === value ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <section
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-${format}`}
          tabIndex={0}
          aria-busy={!error && content === null}
          className="min-h-0 flex-1 overflow-auto bg-surface-soft"
        >
          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <p role="alert" className="text-sm text-error">
                {error}
              </p>
              <button
                type="button"
                className="button-secondary button-small"
                onClick={() => setRetry((value) => value + 1)}
              >
                Réessayer
              </button>
            </div>
          ) : content === null ? (
            <p
              role="status"
              className="flex h-full items-center justify-center gap-3 text-sm text-muted"
            >
              <LoaderCircle
                size={20}
                className="motion-safe:animate-spin"
                aria-hidden="true"
              />
              Chargement de la facture…
            </p>
          ) : format === "html" ? (
            <iframe
              ref={frameRef}
              title={`Facture imprimable ${facture.numero}`}
              srcDoc={content}
              sandbox="allow-same-origin allow-modals"
              onLoad={frameLoaded}
              className="h-full w-full border-0"
            />
          ) : (
            <pre className="m-4 whitespace-pre-wrap break-words rounded-md border border-hairline-soft bg-white p-4 font-mono text-xs leading-6 sm:m-6 sm:p-6 sm:text-sm">
              {content}
            </pre>
          )}
        </section>
        <footer className="shrink-0 border-t border-hairline-soft bg-white px-4 py-3 sm:px-6 sm:py-4">
          {downloadError && (
            <p role="alert" className="mb-3 text-sm text-error">
              {downloadError}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={downloading}
              onClick={downloadXml}
              className="button-tertiary text-xs text-muted disabled:opacity-50"
            >
              <Download size={14} aria-hidden="true" />
              {downloading ? "Téléchargement…" : "Exporter XML"}
            </button>
            <div className="flex flex-wrap gap-2">
              {format === "html" && (
                <button
                  type="button"
                  disabled={!printReady}
                  className="button-secondary button-small"
                  onClick={() => {
                    frameRef.current?.contentWindow?.focus();
                    frameRef.current?.contentWindow?.print();
                  }}
                >
                  <Printer size={16} aria-hidden="true" />
                  Imprimer
                </button>
              )}
              <button
                type="button"
                disabled={content === null || Boolean(error)}
                className="button-primary button-small"
                onClick={() =>
                  downloadDocument(facture.numero, format, content)
                }
              >
                <Download size={16} aria-hidden="true" />
                Télécharger {format.toUpperCase()}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </dialog>
  );
}
