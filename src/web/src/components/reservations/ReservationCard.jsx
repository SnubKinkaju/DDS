import { Link } from "react-router";
import { ReceiptText } from "lucide-react";
import { formatPrice, plural } from "../../utils/format.js";
import { formatDate, todayInParis } from "../../utils/dates.js";

const statuses = {
  en_attente: ["En attente", "bg-amber-50 text-amber-800"],
  acceptee: ["Acceptée", "bg-green-50 text-green-800"],
  refusee: ["Refusée", "bg-red-50 text-red-800"],
  annulee: ["Annulée", "bg-surface-strong text-muted"],
  terminee: ["Terminée", "bg-surface-strong text-muted"],
};

export default function ReservationCard({
  reservation: item,
  received,
  busy,
  onAction,
  onViewInvoice,
}) {
  const [label, color] = statuses[item.statut];
  const person = received ? item.voyageur : item.proprietaire;
  const past = item.dateFin <= todayInParis();
  return (
    <article className="rounded-md border border-hairline-soft p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {item.logement.statut === "publie" ? (
              <Link
                to={`/logements/${item.logement.id}`}
                className="hover:underline"
              >
                {item.logement.titre}
              </Link>
            ) : (
              item.logement.titre
            )}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {item.logement.ville} · {received ? "Demandé par" : "Proposé par"}{" "}
            {person.prenom} {person.nom}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}
        >
          {label}
          {past ? " · Séjour passé" : ""}
        </span>
      </div>
      <p className="mt-5 font-medium">
        {formatDate(item.dateDebut)} → {formatDate(item.dateFin)}
      </p>
      <p className="mt-1 text-sm text-muted">
        {plural(item.nombreNuits, "nuit")} ·{" "}
        {plural(item.nombreVoyageurs, "voyageur")}
      </p>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">
            {formatPrice(item.montantTotalCentimes)}
          </p>
          <p className="text-xs text-muted">
            {formatPrice(item.prixNuitCentimes)} par nuit, tarif conservé à la
            demande
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.facture && (
            <button
              type="button"
              onClick={() => onViewInvoice(item.facture)}
              className="button-primary button-small"
            >
              <ReceiptText size={16} aria-hidden="true" /> Voir la facture
            </button>
          )}
          {item.actions.includes("annulee") && (
            <button
              disabled={busy}
              onClick={() => onAction(item, "annulee")}
              className="button-secondary button-small"
            >
              {item.statut === "en_attente"
                ? "Annuler la demande"
                : "Annuler le séjour"}
            </button>
          )}
          {item.actions.includes("refusee") && (
            <button
              disabled={busy}
              onClick={() => onAction(item, "refusee")}
              className="button-secondary button-small"
            >
              Refuser
            </button>
          )}
          {item.actions.includes("acceptee") && (
            <button
              disabled={busy}
              onClick={() => onAction(item, "acceptee")}
              className="button-primary button-small"
            >
              Accepter
            </button>
          )}
        </div>
      </div>
      {received &&
        item.statut === "en_attente" &&
        !item.actions.includes("acceptee") && (
          <p className="mt-4 text-sm text-muted">
            Acceptation impossible : vérifiez les dates, la publication et la
            capacité du logement.
          </p>
        )}
    </article>
  );
}
