// src/pages/RadiationsPage.tsx
import { useState, useEffect } from "react";
import type { FC } from "react";
import { RADIATIONS_MOCK } from "../modules/mock";
import type { RadiationRange } from "../modules/mock";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { RadiationCard } from "../components/RadiationCard";
import { CartWidget } from "../components/CartWidget";

export const RadiationsPage: FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [radiations, setRadiations] = useState<RadiationRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // GET запрос №1: Список услуг с фильтрацией
  const fetchRadiations = async (search: string = "") => {
    setIsLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/radiations${query}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRadiations(data);
    } catch (error) {
      console.warn("Fallback на mock-данные", error);
      const filtered = RADIATIONS_MOCK.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setRadiations(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRadiations(); }, []);

  return (
    <div className="app-container">
      <BreadCrumbs crumbs={[]} />
      <div className="sub-header" style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Поиск по названию..." 
          value={searchValue} 
          onChange={(e) => setSearchValue(e.target.value)}
          className="search-input" 
        />
        <button onClick={() => fetchRadiations(searchValue)} className="btn-details">Найти</button>
        <CartWidget /> {/* GET запрос №3 внутри компонента (корзина) */}
      </div>
      <h2 className="section-title">Каталог диапазонов</h2>
      <div className="services-grid">
        {isLoading ? <p>Загрузка...</p> : radiations.map(r => <RadiationCard key={r.id} {...r} />)}
      </div>
    </div>
  );
};