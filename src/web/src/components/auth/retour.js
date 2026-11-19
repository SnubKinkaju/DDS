import { useLocation } from "react-router";

export function useRetourConnexion() {
  const { state } = useLocation();
  const from = state?.from;
  const destination =
    typeof from === "string" && /^\/(?![\/\\])/.test(from) ? from : "/";
  return { destination, reservation: state?.reservation };
}
