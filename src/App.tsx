import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ROUTES } from "./Routes";
import { NavBar } from "./components/NavBar";
import { RadiationsPage } from "./pages/RadiationsPage";
import { RadiationDetailPage } from "./pages/RadiationDetailPage";
import { CartPage } from "./pages/CartPage";

function App() {
  return (
    <BrowserRouter>
      {/* Navbar будет отображаться на всех страницах */}
      <div style={{maxWidth: '1200px', margin: '0 auto'}}>
        <NavBar />
      </div>
      <Routes>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.RADIATIONS} replace />} />
        <Route path={ROUTES.RADIATIONS} element={<RadiationsPage />} />
        <Route path={`${ROUTES.RADIATIONS}/:id`} element={<RadiationDetailPage />} />
        <Route path={ROUTES.CART} element={<CartPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;