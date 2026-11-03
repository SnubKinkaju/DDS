import { Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import CataloguePage from "./pages/CataloguePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PublishListingPage from "./pages/PublishListingPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

import UpcomingPage from "./pages/UpcomingPage.jsx";
import { upcomingPages } from "./data/navigation.js";
import ListingDetailPage from "./pages/ListingDetailPage.jsx";

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
      {upcomingPages.map(({ path, title, description, Icon }) => (
        <Route key={path} path={path}
          element={<UpcomingPage title={title} description={description} Icon={Icon} />} />
      ))}
      <Route path="/logements/:logementId" element={<ListingDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
