import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ROUTES } from "./Routes";
import { NavBar } from "./components/NavBar";
import { RadiationsPage } from "./pages/RadiationsPage";
import { RadiationDetailPage } from "./pages/RadiationDetailPage";
import { CalculationsListPage } from "./pages/CalculationsListPage";
import { CalculationDetailPage } from "./pages/CalculationDetailPage";
import { AuthPage } from "./pages/AuthPage";
import { fetchDraftSummary } from "./slices/applicationSlice";
import type { RootState, AppDispatch } from "./store";

// Если это Tauri, роутер работает от корня '/'. 
// Если это Github Pages (браузер) - от имени репозитория.

const routerBaseName = "/";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.applications.loading);
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);

  // Как только приложение загрузилось (или юзер вошел), проверяем, есть ли у него висящий черновик
  useEffect(() => {
    if (isAuth) {
      dispatch(fetchDraftSummary());
    }
  }, [isAuth, dispatch]);

  return (
    <BrowserRouter basename= {routerBaseName}>
      {/* Глобальный блокировщик экрана при выполнении Thunk-запросов (по ТЗ) */}
      {isLoading && (
        <div 
            className="global-loader position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
            style={{ backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 9999 }}
        >
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}
      
      <div className="container mt-4" style={{ maxWidth: '1200px' }}>
        <NavBar />
        
        <Routes>
          <Route path={ROUTES.RADIATIONS} element={<RadiationsPage />} />
          <Route path={ROUTES.LOGIN} element={<AuthPage type="login" />} />
          <Route path={ROUTES.REGISTER} element={<AuthPage type="register" />} />
          
          <Route path={ROUTES.CALCULATIONS} element={<CalculationsListPage />} />
          <Route path={`${ROUTES.CALCULATIONS}/:id`} element={<CalculationDetailPage />} />
          
          <Route path="/:id" element={<RadiationDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;