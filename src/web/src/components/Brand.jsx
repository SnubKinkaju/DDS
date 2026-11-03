import { MountainSnow } from "lucide-react";
import { Link } from "react-router";

function Brand({ compact = false }) {
  return (
    <Link
      className="flex shrink-0 items-center gap-1.5 rounded-sm text-primary"
      to="/"
      aria-label="Refuge climatique — accueil"
    >
      <MountainSnow aria-hidden="true" size={32} strokeWidth={2.25} />
      <span
        className={`text-[19px] font-bold tracking-[-0.03em] ${compact ? "hidden lg:inline" : ""}`}
      >
        refuge
      </span>
    </Link>
  );
}

export default Brand;
