import { useEffect, useState } from "react";
import { request } from "../services/api.js";

export default function useResource(path, revision = 0) {
  const [state, setState] = useState({});
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    request(path, { signal: controller.signal })
      .then((data) => setState({ path, revision, data }))
      .catch((error) => {
        if (!controller.signal.aborted) setState({ path, revision, error });
      });
    return () => controller.abort();
  }, [path, revision]);
  return state.path === path && state.revision === revision ? state : {};
}
