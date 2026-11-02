import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import AuthLayout from "../components/auth/AuthLayout.jsx";
import FormField from "../components/auth/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { utilisateur, chargement, connexion } = useAuth();
  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  if (!chargement && utilisateur) {
    return <Navigate to="/" replace />;
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
      navigate("/", { replace: true });
    } catch (error) {
      setErreur(error.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <AuthLayout
      title="Se connecter"
      description="Retrouvez vos réservations et les logements que vous proposez."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link className="font-semibold text-ink underline underline-offset-4" to="/inscription">
            Créer un compte
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {erreur && (
          <p
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {erreur}
          </p>
        )}

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
          className="h-12 w-full rounded-lg bg-primary px-6 text-base font-semibold text-white transition-colors hover:bg-primary-active disabled:cursor-wait disabled:bg-primary-soft"
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
