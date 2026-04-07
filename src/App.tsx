import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "./Routes";
import { NavBar } from "./components/NavBar";
import { HomePage } from "./pages/HomePage";
import { RadiationsPage } from "./pages/RadiationsPage";
import { RadiationDetailPage } from "./pages/RadiationDetailPage";
import { CartWidget } from "./components/CartWidget";

function App() {
  return (
    <BrowserRouter>
      <div style={{maxWidth: '1200px', margin: '0 auto'}}>
        <NavBar />
      </div>
      
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.RADIATIONS} element={<RadiationsPage />} />
        <Route path={`${ROUTES.RADIATIONS}/:id`} element={<RadiationDetailPage />} />
      </Routes>
      
      <CartWidget />
    </BrowserRouter>
  );
}

export default App;