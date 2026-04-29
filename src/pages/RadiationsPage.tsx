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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { items: displayRadiations, ready, searchByImage, resetSearch } = useRadiationSearch(fetchedRadiations);

  const fetchRadiations = async (search: string = "") => {
    setIsLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/radiations${query}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFetchedRadiations(data);
    } catch (error) {
      console.warn("Fallback на mock-данные");
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
      <BreadCrumbs crumbs={[{ label: 'Главная' }]} />
      
      {/* Панель поиска и фильтров */}
      <div className="bg-white p-3 p-md-4 rounded shadow-sm mb-4">
        <div className="row g-3 align-items-center">
          {/* Поиск по тексту */}
          <div className="col-12 col-md-6">
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Поиск диапазона по названию..." 
                value={searchValue} 
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchRadiations(searchValue)}
                className="form-control" 
              />
              <button onClick={() => fetchRadiations(searchValue)} className="btn btn-primary">
                Найти
              </button>
            </div>
          </div>

          {/* Поиск по картинке (ИИ) */}
          <div className="col-12 col-md-6 d-flex align-items-center justify-content-md-end gap-2">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            {/* ТУТ ПОМЕНЯЛИ btn-outline-secondary НА btn-outline-primary */}
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className={`btn ${ready ? 'btn-outline-primary' : 'btn-secondary'} fw-bold d-flex align-items-center gap-2 shadow-sm`}
              disabled={!ready}
            >
              📷 {ready ? 'Поиск по фото' : 'Загрузка ИИ...'}
            </button>

            {selectedImage && (
              <div className="d-flex align-items-center gap-2 border border-primary rounded p-1 pe-2 bg-light">
                <img src={selectedImage} alt="Preview" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                <button onClick={handleClearImage} className="btn-close" aria-label="Close"></button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="fw-bold mb-3 text-primary">Каталог диапазонов</h3>
      
      {/* Сетка карточек */}
      <div className="services-grid">
        {isLoading ? (
          <div className="text-center w-100 py-5 text-muted">Загрузка данных...</div>
        ) : displayRadiations.length > 0 ? (
          displayRadiations.map(r => <RadiationCard key={r.id} {...r} />)
        ) : (
          <div className="text-center w-100 py-5 text-muted">Ничего не найдено. Попробуйте изменить запрос.</div>
        )}
      </div>

      <CartWidget />
    </div>
  );
};