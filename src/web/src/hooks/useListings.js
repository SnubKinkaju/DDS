import { useEffect, useState } from "react";
import { listLogements } from "../services/logementApi.js";

export default function useListings() {
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let active = true;
    listLogements()
      .then((data) => {
        if (active) setLogements(data.logements);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return { logements, loading, error };
}
