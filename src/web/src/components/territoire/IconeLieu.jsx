import {
  BusFront,
  Cross,
  Droplets,
  House,
  ShoppingBasket,
  Trees,
  Waves,
  WavesLadder,
} from "lucide-react";
import { couleurs } from "../../data/territoire.js";

const icones = {
  logement: House,
  eau: Droplets,
  pharmacie: Cross,
  transport: BusFront,
  lac: Waves,
  piscine: WavesLadder,
  alimentation: ShoppingBasket,
  lieu_frais: Trees,
};

export function GlypheLieu({ categorie, size = 18 }) {
  const Icon = icones[categorie];
  return <Icon size={size} strokeWidth={2} aria-hidden="true" />;
}

export default function IconeLieu({ categorie }) {
  return (
    <span className="lieu-icone" style={{ "--teinte": couleurs[categorie] }}>
      <GlypheLieu categorie={categorie} />
    </span>
  );
}
