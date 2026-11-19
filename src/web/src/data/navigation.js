import { CalendarDays, Heart, House, UserRound } from "lucide-react";

/** Liens de l’espace personnel, partagés par le menu compte et la page compte. */
export const accountLinks = [
  {
    label: "Voyager",
    items: [
      { to: "/reservations", label: "Mes séjours", Icon: CalendarDays },
      { to: "/favoris", label: "Mes favoris", Icon: Heart },
    ],
  },
  {
    label: "Héberger",
    items: [
      { to: "/mes-logements", label: "Mes logements", Icon: House },
      { to: "/reservations?vue=recues", label: "Demandes reçues", Icon: CalendarDays },
    ],
  },
  {
    label: "Profil",
    items: [{ to: "/compte", label: "Mon compte", Icon: UserRound }],
  },
];
