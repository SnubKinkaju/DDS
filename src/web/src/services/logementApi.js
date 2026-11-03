import { request } from "./api.js";

function listLogements() {
  return request("/api/logements");
}

function getLogement(logementId) {
  return request(`/api/logements/${logementId}`);
}

function createLogement(data) {
  return request("/api/logements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export { createLogement, getLogement, listLogements };

export const listMyLogements = () => request("/api/logements/mes-logements");
export const getOwnedLogement = (id) => request(`/api/logements/${id}/gestion`);
export const listEquipements = () => request("/api/logements/equipements");
export const updateLogement = (id, data) =>
  request(`/api/logements/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const setLogementStatus = (id, statut) =>
  request(`/api/logements/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify({ statut }),
  });
export const deleteLogement = (id) =>
  request(`/api/logements/${id}`, { method: "DELETE" });
export function uploadPhoto(id, file) {
  const body = new FormData();
  body.append("photo", file);
  return request(`/api/logements/${id}/photos`, { method: "POST", body });
}
export const deletePhoto = (id, photoId) =>
  request(`/api/logements/${id}/photos/${photoId}`, {
    method: "DELETE",
  });
