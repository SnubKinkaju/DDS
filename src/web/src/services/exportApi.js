import { ApiError } from "./api.js";

const FILENAME = "base_de_donnees.xml";

/** Demande l’export XML de la base à l’API puis le fait télécharger par le navigateur. */
export async function exportBaseDeDonnees() {
  const response = await fetch("/api/export/base-de-donnees.xml", {
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new ApiError(response.status, error);
  }

  const xml = await response.blob();
  const url = URL.createObjectURL(xml);
  const link = document.createElement("a");
  link.href = url;
  link.download = FILENAME;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
