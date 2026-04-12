import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "./Routes";
import { NavBar } from "./components/NavBar";
import { RadiationsPage } from "./pages/RadiationsPage";
import { RadiationDetailPage } from "./pages/RadiationDetailPage";

function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <NavBar />
      </div>
      
      <Routes>
        {/* Главная - список услуг */}
        <Route path={ROUTES.RADIATIONS} element={<RadiationsPage />} />
        
        {/* Подробная страница услуги */}
        <Route path="/:id" element={<RadiationDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;