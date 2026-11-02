import { MountainSnow } from "lucide-react";
import { Link } from "react-router";

function Brand() {
  return (
    <Link
      className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.02em] text-primary"
      to="/"
      aria-label="Refuge climatique — accueil"
    >
      <span className="grid size-9 place-items-center rounded-full bg-primary text-white">
        <MountainSnow aria-hidden="true" size={20} strokeWidth={2.2} />
      </span>
      <span className="hidden sm:inline">Refuge climatique</span>
    </Link>
  );
}

export default Brand;
