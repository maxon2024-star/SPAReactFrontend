import { useState } from "react";
import type { FC } from "react";
import { RADIATIONS_MOCK } from "../modules/mock";
import type { RadiationRange } from "../modules/mock";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { RadiationCard } from "../components/RadiationCard";
import { CartWidget } from "../components/CartWidget"; // Импортируем обратно

export const RadiationsPage: FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [radiations, setRadiations] = useState<RadiationRange[]>(RADIATIONS_MOCK);

  const handleSearch = () => {
    const filtered = RADIATIONS_MOCK.filter(item => 
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setRadiations(filtered);
  };

  return (
    <div className="app-container">
      <BreadCrumbs crumbs={[]} />
      
      <div className="sub-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="search-box" style={{ flexGrow: 1, display: 'flex' }}>
            <input 
              type="text" 
              placeholder="Поиск диапазонов излучения..." 
              value={searchValue} 
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input" 
            />
            <button onClick={handleSearch} className="btn-details" style={{ padding: '8px 20px', marginLeft: '10px' }}>
                Найти
            </button>
        </div>
        
        {/* Возвращаем иконку корзины без цифр */}
        <CartWidget />
      </div>

      <h2 className="section-title">Каталог диапазонов</h2>
      
      <div className="services-grid">
        {radiations.length > 0 ? (
          radiations.map((item) => (
            <RadiationCard key={item.id} {...item} />
          ))
        ) : (
          <h4>Ничего не найдено :(</h4>
        )}
      </div>
    </div>
  );
};