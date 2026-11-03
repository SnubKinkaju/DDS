import { ApiError } from "./api.js";

export async function getFactureDocument(numero, format, signal) {
  const response = await fetch(
    `/api/factures/${encodeURIComponent(numero)}/document.${format}`,
    { credentials: "include", signal },
  );
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new ApiError(response.status, error);
  }
  return response.text();
}

export function downloadDocument(numero, format, content) {
  const types = {
    html: "text/html",
    json: "application/json",
    txt: "text/plain",
    xml: "application/xml",
  };
  const url = URL.createObjectURL(
    new Blob([content], { type: `${types[format]};charset=utf-8` }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${numero}.${format}`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
