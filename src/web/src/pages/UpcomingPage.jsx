import { Link } from "react-router";

import EmptyState from "../components/EmptyState.jsx";
import PageLayout from "../components/PageLayout.jsx";

export default function UpcomingPage({ title, description, Icon }) {
  return (
    <PageLayout width="narrow">
      <h1 className="text-[32px] font-semibold text-ink">{title}</h1>
      <div className="mt-8">
        <EmptyState
          Icon={Icon}
          title="Bientôt disponible"
          action={
            <Link to="/logements" className="button-secondary">
              Parcourir les logements
            </Link>
          }
        >
          {description}
        </EmptyState>
      </div>
    </PageLayout>
  );
}
