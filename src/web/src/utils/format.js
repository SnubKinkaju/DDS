const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(centimes) {
  return euros.format(centimes / 100);
}

export function plural(count, word) {
  return `${count} ${word}${count > 1 ? "s" : ""}`;
}

export function initials(person) {
  return `${person.prenom?.[0] ?? ""}${person.nom?.[0] ?? ""}`.toUpperCase();
}
