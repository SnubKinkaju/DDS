import { Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import CataloguePage from "./pages/CataloguePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ListingDetailPage from "./pages/ListingDetailPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MapPage from "./pages/MapPage.jsx";
import PublishListingPage from "./pages/PublishListingPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import MyListingsPage from "./pages/MyListingsPage.jsx";
import EditListingPage from "./pages/EditListingPage.jsx";
import UpcomingPage from "./pages/UpcomingPage.jsx";
import { upcomingPages } from "./data/navigation.js";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/logements" element={<CataloguePage />} />
      <Route path="/logements/:logementId" element={<ListingDetailPage />} />
      <Route path="/carte" element={<MapPage />} />
      {upcomingPages.map(({ path, title, description, Icon }) => (
        <Route
          key={path}
          path={path}
          element={<UpcomingPage title={title} description={description} Icon={Icon} />}
        />
      ))}
      <Route
        path="/mes-logements"
        element={
          <ProtectedRoute>
            <MyListingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mes-logements/:logementId/modifier"
        element={
          <ProtectedRoute>
            <EditListingPage />
          </ProtectedRoute>
        }
      />
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
