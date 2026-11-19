import { createContext, useContext, useEffect, useMemo, useState } from "react";

import * as authApi from "../services/authApi.js";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let active = true;

    authApi
      .getCurrentUser()
      .then((response) => {
        if (active) setUtilisateur(response.utilisateur);
      })
      .catch(() => {
        if (active) setUtilisateur(null);
      })
      .finally(() => {
        if (active) setChargement(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      utilisateur,
      chargement,
      async connexion(credentials) {
        const response = await authApi.login(credentials);
        setUtilisateur(response.utilisateur);
        return response.utilisateur;
      },
      async inscription(data) {
        const response = await authApi.register(data);
        setUtilisateur(response.utilisateur);
        return response.utilisateur;
      },
      async deconnexion() {
        await authApi.logout();
        setUtilisateur(null);
      },
      async actualiserUtilisateur() {
        const response = await authApi.getCurrentUser();
        setUtilisateur(response.utilisateur);
        return response.utilisateur;
      },
    }),
    [utilisateur, chargement],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider.");
  }
  return context;
}

export { AuthProvider, useAuth };
