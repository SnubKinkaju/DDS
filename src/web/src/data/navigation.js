import { CalendarDays, Heart, House, MessageCircle, UserRound } from "lucide-react";

export const upcomingPages = [
  {
    path: "/favoris",
    title: "Mes favoris",
    description: "Vous pourrez enregistrer vos logements préférés pour les retrouver facilement.",
    Icon: Heart,
  },
  {
    path: "/messages",
    title: "Messages",
    description: "Vous pourrez échanger avec les propriétaires et les voyageurs depuis cet espace.",
    Icon: MessageCircle,
  },
];

/** Liens de l’espace personnel, partagés par le menu compte et la page compte. */
export const accountLinks = [
  {
    label: "Voyager",
    items: [
      { to: "/reservations", label: "Mes séjours", Icon: CalendarDays },
      ...upcomingPages.map(({ path, title, Icon }) => ({
        to: path,
        label: title,
        Icon,
        upcoming: true,
      })),
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
