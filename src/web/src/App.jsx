import { Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import CataloguePage from "./pages/CataloguePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PublishListingPage from "./pages/PublishListingPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/logements" element={<CataloguePage />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route
        path="/compte"
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/publier"
        element={
          <ProtectedRoute>
            <PublishListingPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
