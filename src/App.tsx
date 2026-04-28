import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "./Routes";
import { NavBar } from "./components/NavBar";
import { RadiationsPage } from "./pages/RadiationsPage";
import { RadiationDetailPage } from "./pages/RadiationDetailPage";
import { ApplicationsPage } from "./pages/RadiationsPage";
import { CalculationDetailPage } from "./pages/CalculationDetailPage";
import { AuthPage } from "./pages/AuthPage";
import type { RootState } from "./store";

function App() {
  const isLoading = useSelector((state: RootState) => state.applications.loading);

  return (
    <BrowserRouter>
      {isLoading && (
        <div className="global-loader">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <NavBar />
      </div>
      
      <Routes>
        <Route path={ROUTES.RADIATIONS} element={<RadiationsPage />} />
        <Route path={ROUTES.LOGIN} element={<AuthPage type="login" />} />
        <Route path={ROUTES.REGISTER} element={<AuthPage type="register" />} />
        
        {/* Роуты заявок (radiation_calculation) */}
        <Route path={ROUTES.CALCULATIONS} element={<RadiationsPage />} />
        <Route path={`${ROUTES.CALCULATIONS}/:id`} element={<CalculationDetailPage />} />
        
        <Route path="/:id" element={<RadiationDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;