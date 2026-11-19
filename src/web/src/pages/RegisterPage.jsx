import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import ErrorMessage from "../components/ErrorMessage.jsx";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import FormField from "../components/auth/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  motDePasse: "",
  confirmation: "",
};

function RegisterPage() {
  const navigate = useNavigate();
  const { utilisateur, chargement, inscription } = useAuth();
  const [form, setForm] = useState(initialForm);
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

    if (form.motDePasse !== form.confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setEnvoi(true);

    try {
      await inscription({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone || null,
        motDePasse: form.motDePasse,
      });
      navigate("/", { replace: true });
    } catch (error) {
      setErreur(error.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <AuthLayout
      title="Inscription"
      heading="Bienvenue sur Refuge climatique"
      description="Un seul compte pour réserver un logement et proposer le vôtre."
      footer={
        <>
          Vous avez déjà un compte ?{" "}
          <Link className="font-semibold text-ink underline underline-offset-4" to="/connexion">
            Se connecter
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <ErrorMessage error={erreur} className="" />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="prenom"
            label="Prénom"
            name="prenom"
            type="text"
            autoComplete="given-name"
            required
            maxLength="80"
            value={form.prenom}
            onChange={updateField}
          />
          <FormField
            id="nom"
            label="Nom"
            name="nom"
            type="text"
            autoComplete="family-name"
            required
            maxLength="80"
            value={form.nom}
            onChange={updateField}
          />
        </div>

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
          id="telephone"
          label="Téléphone (facultatif)"
          name="telephone"
          type="tel"
          autoComplete="tel"
          maxLength="30"
          value={form.telephone}
          onChange={updateField}
        />

        <FormField
          id="motDePasse"
          label="Mot de passe"
          name="motDePasse"
          type="password"
          autoComplete="new-password"
          required
          minLength="8"
          maxLength="128"
          hint="8 caractères minimum."
          value={form.motDePasse}
          onChange={updateField}
        />

        <FormField
          id="confirmation"
          label="Confirmer le mot de passe"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          required
          minLength="8"
          maxLength="128"
          value={form.confirmation}
          onChange={updateField}
        />

        <button
          className="button-primary w-full"
          type="submit"
          disabled={envoi}
        >
          {envoi ? "Création…" : "Créer mon compte"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
