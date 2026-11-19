import {
  Accessibility,
  AirVent,
  BedDouble,
  Blinds,
  Building2,
  Check,
  CookingPot,
  DoorOpen,
  Fan,
  Flower2,
  House,
  LayoutGrid,
  SquareParking,
  Sun,
  TreePine,
  WashingMachine,
  Wifi,
} from "lucide-react";

export const listingTypes = [
  { value: "appartement", label: "Appartement", Icon: Building2 },
  { value: "maison", label: "Maison", Icon: House },
  { value: "chalet", label: "Chalet", Icon: TreePine },
  { value: "studio", label: "Studio", Icon: DoorOpen },
  { value: "chambre", label: "Chambre", Icon: BedDouble },
];

export const allTypes = { value: "", label: "Tous", Icon: LayoutGrid };

export function typeLabel(value) {
  return listingTypes.find((type) => type.value === value)?.label ?? value;
}

export function typeIcon(value) {
  return listingTypes.find((type) => type.value === value)?.Icon ?? House;
}

const amenityIcons = {
  "accès sans marches": Accessibility,
  climatisation: AirVent,
  cuisine: CookingPot,
  jardin: Flower2,
  "lave-linge": WashingMachine,
  parking: SquareParking,
  terrasse: Sun,
  ventilateur: Fan,
  volets: Blinds,
  "wi-fi": Wifi,
};

export function amenityIcon(name) {
  return amenityIcons[name.trim().toLowerCase()] ?? Check;
}
