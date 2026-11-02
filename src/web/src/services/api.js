class ApiError extends Error {
  constructor(status, response) {
    super(response?.error?.message ?? "Une erreur inattendue est survenue.");
    this.name = "ApiError";
    this.status = status;
    this.code = response?.error?.code;
    this.details = response?.error?.details ?? [];
  }
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const content = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new ApiError(response.status, content);
  }

  return content;
}

export { ApiError, request };
