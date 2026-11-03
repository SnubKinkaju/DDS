import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CalendarDays, RefreshCw } from "lucide-react";
import PageLayout from "../components/PageLayout.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import ReservationCard from "../components/reservations/ReservationCard.jsx";
import { listReservations, setReservationStatus } from "../services/reservationApi.js";

export default function ReservationsPage() {
  const [params, setParams] = useSearchParams();
  const received = params.get("vue") === "recues";
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    listReservations(received)
      .then((data) => {
        if (active) setReservations(data.reservations);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [received, refresh]);

  async function act(item, status) {
    const confirmation =
      status === "acceptee"
        ? "Accepter ce séjour ? Les demandes en attente qui chevauchent ces dates seront refusées automatiquement."
        : status === "refusee"
          ? "Refuser cette demande ?"
          : "Annuler cette réservation ?";
    if (!window.confirm(confirmation)) return;
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      const response = await setReservationStatus(item.id, status);
      setReservations((items) =>
        items.map((row) => (row.id === item.id ? response.reservation : row)),
      );
      setNotice(
        status === "acceptee"
          ? "Séjour accepté. Les dates sont réservées et les demandes concurrentes refusées."
          : status === "refusee"
            ? "Demande refusée."
            : "Réservation annulée.",
      );
      const data = await listReservations(received);
      setReservations(data.reservations);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageLayout width="narrow">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[32px] font-semibold">Mes réservations</h1>
        <button
          type="button"
          className="button-tertiary"
          disabled={busy || loading}
          onClick={() => setRefresh((value) => value + 1)}
        >
          <RefreshCw size={16} aria-hidden="true" /> Actualiser
        </button>
      </div>
      <div
        className="mt-6 flex gap-6 border-b border-hairline-soft"
        aria-label="Vue des réservations"
      >
        {[
          [false, "Mes séjours"],
          [true, "Demandes reçues"],
        ].map(([value, label]) => (
          <button
            key={label}
            type="button"
            disabled={busy}
            aria-pressed={received === value}
            onClick={() => {
              setNotice("");
              setParams(value ? { vue: "recues" } : {});
            }}
            className={`border-b-2 py-4 text-sm font-semibold ${received === value ? "border-ink text-ink" : "border-transparent text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-5 text-sm text-muted">
        {received
          ? "Acceptez ou refusez les séjours demandés dans vos logements. Seule une acceptation bloque les dates."
          : "Retrouvez vos demandes et la réponse des propriétaires. Vous pouvez annuler jusqu’au jour d’arrivée inclus."}
      </p>
      {notice && (
        <p role="status" className="mt-5 text-sm text-success">
          {notice}
        </p>
      )}
      <ErrorMessage error={error} />
      {loading && (
        <p role="status" className="py-12 text-muted">
          Chargement des réservations…
        </p>
      )}
      {!loading && !error && reservations.length === 0 && (
        <EmptyState
          Icon={CalendarDays}
          title={received ? "Aucune demande reçue" : "Pas encore de séjour"}
          action={
            <Link className="button-secondary" to={received ? "/mes-logements" : "/logements"}>
              {received ? "Mes logements" : "Trouver un logement"}
            </Link>
          }
        >
          {received
            ? "Les demandes pour vos logements apparaîtront ici."
            : "Choisissez un logement et proposez vos dates au propriétaire."}
        </EmptyState>
      )}
      {!loading && (
        <div className="mt-6 space-y-4">
          {reservations.map((item) => (
            <ReservationCard
              key={item.id}
              reservation={item}
              received={received}
              busy={busy}
              onAction={act}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
