import { useState } from "react";
import { Heart } from "lucide-react";
import useResource from "../../hooks/useResource.js";
import { request } from "../../services/api.js";

export default function FavoriteButton({ id }) {
  const { data, error } = useResource("/api/favoris");
  const [local, setLocal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const active = local ?? data?.logements.some((item) => item.id === id);
  async function toggle() {
    setBusy(true);
    setFailure("");
    try {
      await request(`/api/favoris/${id}`, {
        method: active ? "DELETE" : "PUT",
      });
      setLocal(!active);
    } catch (err) {
      setFailure(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button
        aria-pressed={Boolean(active)}
        disabled={busy || !data}
        onClick={toggle}
        className="button-secondary button-small"
      >
        <Heart size={17} fill={active ? "currentColor" : "none"} />{" "}
        {active ? "Retirer des favoris" : "Enregistrer en favori"}
      </button>
      {(error || failure) && <p role="alert">{failure || error.message}</p>}
    </div>
  );
}
