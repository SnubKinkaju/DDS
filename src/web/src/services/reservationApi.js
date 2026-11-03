import { request } from "./api.js";

export const getBookedDates = (id) => request(`/api/logements/${id}/dates-reservees`);
export const listReservations = (received = false) =>
  request(received ? "/api/reservations/recues" : "/api/reservations");
export const createReservation = (data) =>
  request("/api/reservations", { method: "POST", body: JSON.stringify(data) });
export const setReservationStatus = (id, statut) =>
  request(`/api/reservations/${id}`, { method: "PATCH", body: JSON.stringify({ statut }) });
