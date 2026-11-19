import { useNavigate } from "react-router";

import PageLayout from "../components/PageLayout.jsx";
import ListingForm from "../components/listings/ListingForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createLogement } from "../services/logementApi.js";

export default function PublishListingPage() {
  const navigate = useNavigate();
  const { actualiserUtilisateur } = useAuth();

  async function save(data) {
    const response = await createLogement(data);
    // La publication réussie ne doit pas être répétée si le rafraîchissement échoue.
    actualiserUtilisateur().catch(() => {});
    navigate(`/mes-logements/${response.logement.id}/modifier`, {
      replace: true,
      state: { created: true },
    });
  }

  return (
    <PageLayout width="narrow">
      <header className="mb-8 border-b border-hairline-soft pb-8">
        <h1 className="text-[32px] font-semibold text-ink">Publier un logement</h1>
        <p className="mt-2 max-w-xl text-base text-muted">
          Décrivez votre logement en quelques étapes. Vous ajouterez les photos
          juste après.
        </p>
      </header>
      <ListingForm onSave={save} />
    </PageLayout>
  );
}
