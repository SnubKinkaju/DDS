import { useEffect, useState } from "react";
import { Link } from "react-router";

import ErrorMessage from "../ErrorMessage.jsx";
import FormField from "../auth/FormField.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { createReservation, getBookedDates } from "../../services/reservationApi.js";
import { formatPrice, plural } from "../../utils/format.js";
import { formatDate, numberOfNights, todayInParis } from "../../utils/dates.js";

export default function ReservationForm({ logement, isOwner }) {
  const { utilisateur, chargement } = useAuth();
  const [form, setForm] = useState({ dateDebut: "", dateFin: "", nombreVoyageurs: 1 });
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setAvailabilityError(null);
    getBookedDates(logement.id)
      .then((data) => {
        if (active) setPeriods(data.periodes);
      })
      .catch((err) => {
        if (active) setAvailabilityError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [logement.id, refresh]);

  const nights = numberOfNights(form.dateDebut, form.dateFin);
  const today = todayInParis();
  const overlap = periods.some(
    (period) => period.dateDebut < form.dateFin && period.dateFin > form.dateDebut,
  );
  const validDates = nights > 0 && form.dateDebut >= today && !overlap;

  function update(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: name === "nombreVoyageurs" ? Number(value) : value,
    }));
    setError(null);
  }

  async function submit(event) {
    event.preventDefault();
    if (busy || !validDates) return;
    setBusy(true);
    setError(null);
    try {
      const response = await createReservation({ logementId: logement.id, ...form });
      setCreated(response.reservation);
    } catch (err) {
      setError(err);
      if (err.status === 409) setRefresh((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-hairline p-6 shadow-floating">
      <p>
        <span className="text-[22px] font-semibold">{formatPrice(logement.prixNuitCentimes)}</span>{" "}
        par nuit
      </p>
      {isOwner ? (
        <>
          <p className="mt-4 text-sm text-muted">Vous êtes propriétaire de ce logement.</p>
          <Link className="button-secondary mt-4 w-full" to="/reservations?vue=recues">
            Voir les demandes reçues
          </Link>
        </>
      ) : created ? (
        <div className="mt-6" role="status">
          <h2 className="font-semibold text-success">Demande envoyée</h2>
          <p className="mt-2 text-sm text-body">
            Du {formatDate(created.dateDebut)} au {formatDate(created.dateFin)}, pour{" "}
            {formatPrice(created.montantTotalCentimes)}.
          </p>
          <p className="mt-2 text-sm text-muted">
            Le propriétaire doit encore accepter votre séjour. Aucun paiement n’est effectué.
          </p>
          <Link className="button-primary mt-5 w-full" to="/reservations">
            Suivre ma demande
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6">
          <fieldset disabled={busy} className="space-y-4">
            <FormField
              id="arrival"
              label="Arrivée"
              type="date"
              name="dateDebut"
              min={today}
              required
              value={form.dateDebut}
              onChange={update}
            />
            <FormField
              id="departure"
              label="Départ"
              type="date"
              name="dateFin"
              min={form.dateDebut || today}
              required
              value={form.dateFin}
              onChange={update}
            />
            <FormField
              id="guests"
              label="Voyageurs"
              type="number"
              name="nombreVoyageurs"
              min="1"
              max={logement.capacite}
              required
              value={form.nombreVoyageurs}
              onChange={update}
              hint={`${plural(logement.capacite, "voyageur")} maximum`}
            />
          </fieldset>
          {form.dateDebut && form.dateFin && !validDates && (
            <p role="alert" className="mt-3 text-sm text-error">
              {overlap
                ? "Ces dates croisent un séjour déjà réservé."
                : "Choisissez une arrivée à partir d’aujourd’hui et un départ après l’arrivée."}
            </p>
          )}
          {nights > 0 && (
            <dl className="mt-5 space-y-3 border-t border-hairline-soft pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt>
                  {plural(nights, "nuit")} × {formatPrice(logement.prixNuitCentimes)}
                </dt>
                <dd>{formatPrice(nights * logement.prixNuitCentimes)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total du séjour</dt>
                <dd>{formatPrice(nights * logement.prixNuitCentimes)}</dd>
              </div>
            </dl>
          )}
          {loading && (
            <p role="status" className="mt-4 text-sm text-muted">
              Vérification des dates…
            </p>
          )}
          <ErrorMessage error={availabilityError || error} />
          {availabilityError && (
            <button
              type="button"
              className="button-tertiary"
              onClick={() => setRefresh((value) => value + 1)}
            >
              Réessayer
            </button>
          )}
          {!chargement && !utilisateur ? (
            <Link
              className="button-primary mt-5 w-full"
              to="/connexion"
              state={{ from: `/logements/${logement.id}` }}
            >
              Se connecter pour réserver
            </Link>
          ) : (
            <button
              className="button-primary mt-5 w-full"
              disabled={busy || loading || chargement || !!availabilityError || !validDates}
            >
              {busy ? "Envoi…" : "Demander ce séjour"}
            </button>
          )}
          <p className="mt-3 text-center text-xs leading-5 text-muted">
            Sous réserve d’acceptation du propriétaire. Aucun paiement à cette étape.
          </p>
          {periods.length > 0 && (
            <details className="mt-5 border-t border-hairline-soft pt-4 text-sm">
              <summary className="cursor-pointer font-medium">Dates déjà réservées</summary>
              <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto text-muted">
                {periods.map((period) => (
                  <li key={`${period.dateDebut}-${period.dateFin}`}>
                    {formatDate(period.dateDebut)} → {formatDate(period.dateFin)} (départ)
                  </li>
                ))}
              </ul>
            </details>
          )}
        </form>
      )}
    </div>
  );
}
