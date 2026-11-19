import PageLayout from "../components/PageLayout.jsx";
import ListingGrid from "../components/listings/ListingGrid.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import useResource from "../hooks/useResource.js";
import { Link } from "react-router";

export default function FavorisPage() {
  const { data, error } = useResource("/api/favoris");
  return (
    <PageLayout>
      <h1 className="mb-6 text-[32px] font-semibold">Mes favoris</h1>
      <ErrorMessage error={error} />
      {data?.total > 0 && <ListingGrid logements={data.logements} />}
      {data?.total === 0 && (
        <p>
          Aucun logement enregistré.{" "}
          <Link className="button-tertiary" to="/logements">
            Parcourir le catalogue
          </Link>
        </p>
      )}
      {!data && !error && <p role="status">Chargement…</p>}
    </PageLayout>
  );
}
