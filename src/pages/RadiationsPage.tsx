// src/pages/RadiationsPage.tsx
import { useState, useEffect, useRef } from "react";
import type { FC } from "react";
import { RADIATIONS_MOCK } from "../modules/mock";
import type { RadiationRange } from "../modules/mock";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { RadiationCard } from "../components/RadiationCard";
import { CartWidget } from "../components/CartWidget";
import { useRadiationSearch } from "../hooks/useRadiationSearch";

export const RadiationsPage: FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [fetchedRadiations, setFetchedRadiations] = useState<RadiationRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояния для поиска по картинке
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Используем наш хук для CLIP, передавая полученные с сервера (или моков) данные
  const { 
    items: displayRadiations, 
    ready, 
    searchByImage, 
    resetSearch 
  } = useRadiationSearch(fetchedRadiations);

  // GET запрос №1: Список услуг с фильтрацией
  const fetchRadiations = async (search: string = "") => {
    setIsLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/radiations${query}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFetchedRadiations(data);
    } catch (error) {
      console.warn("Fallback на mock-данные", error);
      const filtered = RADIATIONS_MOCK.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setFetchedRadiations(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRadiations(); }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      searchByImage(imageUrl);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    resetSearch();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="app-container">
      <BreadCrumbs crumbs={[]} />
      <div className="sub-header" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Поиск по названию..." 
          value={searchValue} 
          onChange={(e) => setSearchValue(e.target.value)}
          className="search-input" 
        />
        <button onClick={() => fetchRadiations(searchValue)} className="btn-details">Найти</button>
        <CartWidget />
      </div>

      {/* Панель поиска по изображению (CLIP) */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '15px', marginBottom: '15px' }}>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="btn-details"
          disabled={!ready}
        >
          {ready ? 'Найти по картинке' : 'Загрузка CLIP...'}
        </button>

        {selectedImage && (
          <>
            <img src={selectedImage} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
            <button onClick={handleClearImage} className="btn-details" style={{ backgroundColor: '#dc3545' }}>Сбросить</button>
          </>
        )}
      </div>

      <h2 className="section-title">Каталог диапазонов</h2>
      <div className="services-grid">
        {isLoading ? (
          <p>Загрузка...</p>
        ) : displayRadiations.length > 0 ? (
          displayRadiations.map(r => <RadiationCard key={r.id} {...r} />)
        ) : (
          <p>Ничего не найдено.</p>
        )}
      </div>
    </div>
  );
};