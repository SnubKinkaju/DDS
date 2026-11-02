import { request } from "./api.js";

function listLogements() {
  return request("/api/logements");
}

function getLogement(logementId) {
  return request(`/api/logements/${logementId}`);
}

export { getLogement, listLogements };
