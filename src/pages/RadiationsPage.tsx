import { useState, useEffect } from "react";
import type { FC } from "react";
import { RADIATIONS_MOCK } from "../modules/mock";
import type { RadiationRange } from "../modules/mock";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { RadiationCard } from "../components/RadiationCard";

export const RadiationsPage: FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [radiations, setRadiations] = useState<RadiationRange[]>(RADIATIONS_MOCK);

  // useEffect для фильтрации (имитация работы бэкенда)
  useEffect(() => {
    const filtered = RADIATIONS_MOCK.filter(item => 
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setRadiations(filtered);
  }, [searchValue]);

  return (
    <div className="app-container">
      {/* Пустой массив, так как мы на корневой странице каталога */}
      <BreadCrumbs crumbs={[]} />
      
      <div className="sub-header">
        <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Поиск диапазонов излучения..." 
              value={searchValue} 
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input" 
            />
        </div>
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