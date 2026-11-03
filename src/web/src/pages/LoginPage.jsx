import { useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router";

import ErrorMessage from "../components/ErrorMessage.jsx";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import FormField from "../components/auth/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const destination =
    state?.from?.startsWith("/") && !state.from.startsWith("//")
      ? state.from
      : "/";
  const { utilisateur, chargement, connexion } = useAuth();
  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  if (!chargement && utilisateur) {
    return <Navigate to={destination} replace />;
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErreur("");
    setEnvoi(true);

    try {
      await connexion(form);
      navigate(destination, { replace: true });
    } catch (error) {
      setErreur(error.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <AuthLayout
      title="Connexion"
      heading="Bon retour parmi nous"
      description="Retrouvez vos réservations et les logements que vous proposez."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link
            className="font-semibold text-ink underline underline-offset-4"
            to="/inscription"
          >
            Créer un compte
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <ErrorMessage error={erreur} className="" />

        <FormField
          id="email"
          label="Adresse email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={updateField}
        />

        <FormField
          id="motDePasse"
          label="Mot de passe"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
          value={form.motDePasse}
          onChange={updateField}
        />

        <button
          className="button-primary w-full"
          type="submit"
          disabled={envoi}
        >
          {envoi ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
