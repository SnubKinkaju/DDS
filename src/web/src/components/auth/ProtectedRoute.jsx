import { Navigate, useLocation } from "react-router";

import { useAuth } from "../../context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { utilisateur, chargement } = useAuth();

  if (chargement) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-soft">
        <p className="text-sm text-muted">Chargement de votre session…</p>
      </div>
    );
  }

  if (!utilisateur) {
    return <Navigate to="/connexion" state={{ from: location.pathname + location.search }} replace />;
  }

  return children;
}

export default ProtectedRoute;
