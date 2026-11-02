import { request } from "./api.js";

function getCurrentUser() {
  return request("/api/auth/moi");
}

function login(credentials) {
  return request("/api/auth/connexion", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

function register(data) {
  return request("/api/auth/inscription", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

function logout() {
  return request("/api/auth/deconnexion", {
    method: "POST",
  });
}

export { getCurrentUser, login, logout, register };
