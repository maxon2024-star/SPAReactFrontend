import { useEffect, useState, useRef } from "react";
import type { FC } from "react";
import { useParams } from "react-router-dom";
import { RADIATIONS_MOCK } from "../modules/mock";
import type { RadiationRange } from "../modules/mock";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { RadiationCard } from "../components/RadiationCard";
import { pipeline, env } from '@xenova/transformers';

// Настройки для Hugging Face
env.allowLocalModels = false;

export const RadiationDetailPage: FC = () => {
  const { id } = useParams();
  const [radiation, setRadiation] = useState<RadiationRange | null>(null);
  const [allItems, setAllItems] = useState<RadiationRange[]>([]);
  
  // Состояния для ИИ-функционала
  const [similarByText, setSimilarByText] = useState<RadiationRange[]>([]);
  const [resultsByImage, setResultsByImage] = useState<RadiationRange[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Загрузка данных (GET запрос №2: Одна услуга)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [itemRes, allRes] = await Promise.all([
          fetch(`/api/radiations/${id}`),
          fetch('/api/radiations')
        ]);
        if (!itemRes.ok || !allRes.ok) throw new Error();
        
        const item = await itemRes.json();
        const all = await allRes.json();
        setRadiation(item);
        setAllItems(all);
      } catch (err) {
        console.warn("Бэкенд недоступен, работаем с mock-данными", err);
        const item = RADIATIONS_MOCK.find(r => r.id === Number(id));
        setRadiation(item || null);
        setAllItems(RADIATIONS_MOCK);
      }
    };
    loadData();
  }, [id]);

  // 2. Автоматический поиск похожих по ТЕКСТУ (all-MiniLM-L6-v2)
  useEffect(() => {
    if (!radiation || allItems.length === 0) return;
    
    const runTextSim = async () => {
      try {
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        const currentOut = await extractor(radiation.description, { pooling: 'mean', normalize: true });
        const currentVec = Array.from(currentOut.data as Float32Array);

        const scored = await Promise.all(allItems.filter(i => i.id !== radiation.id).map(async item => {
          const out = await extractor(item.description, { pooling: 'mean', normalize: true });
          const vec = Array.from(out.data as Float32Array);
          // Косинусное сходство
          const score = currentVec.reduce((acc, v, i) => acc + v * vec[i], 0);
          return { item, score };
        }));
        // Сортируем по убыванию сходства
        const sortedScores = scored.sort((a, b) => b.score - a.score);

        // Выводим результаты в консоль браузера
        console.log(`=== Похожие для: ${radiation.name} ===`);
        sortedScores.forEach(s => {
          console.log(`${s.item.name} | Сходство: ${(s.score * 100).toFixed(2)}%`);
        });

        // Берем топ-3 для отображения
        setSimilarByText(sortedScores.slice(0, 3).map(s => s.item));

        setSimilarByText(scored.sort((a,b) => b.score - a.score).slice(0, 3).map(s => s.item));
      } catch (e) {
        console.error("Ошибка текстового ИИ", e);
      }
    };
    runTextSim();
  }, [radiation, allItems]);

  // 3. Мультимодальный поиск по КАРТИНКЕ (CLIP)
  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAiLoading(true);

    try {
      const url = URL.createObjectURL(file);
      const visionModel = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32');
      const textModel = await pipeline('feature-extraction', 'Xenova/clip-vit-base-patch32');

      const imgOut = await visionModel(url);
      const imgVec = Array.from(imgOut.data as Float32Array);

      const scored = await Promise.all(allItems.map(async item => {
        const txtOut = await textModel(item.description, { pooling: 'mean', normalize: true });
        const txtVec = Array.from(txtOut.data as Float32Array);
        const score = imgVec.reduce((acc, v, i) => acc + v * txtVec[i], 0);
        return { item, score };
      }));

      setResultsByImage(scored.sort((a,b) => b.score - a.score).slice(0, 3).map(s => s.item));
    } catch (e) {
      console.error("Ошибка CLIP поиска", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!radiation) return <div className="app-container">Загрузка данных...</div>;

  return (
    <div className="app-container">
      <BreadCrumbs crumbs={[{ label: radiation.name }]} />

      {}
      <div className="detail-container-vibes" style={{display: 'flex', justifyContent: 'center', marginBottom: '40px'}}>
        <div className="vibes-video-section">
          <video autoPlay loop muted playsInline className="tiktok-video">
              <source src={radiation.video_url} type="video/mp4" />
          </video>
          <div className="vibes-video-overlay">
              <h2 className="video-title">{radiation.name}</h2>
              <p className="video-description">{radiation.description}</p>
          </div>
        </div>
      </div>

      {/* Блок похожих излучений (Автоматический текстовый ИИ) */}
      <div className="similar-radiations-section" style={{ marginTop: '2rem' }}>
        <h3>Похожие по описанию (ИИ):</h3>
        <div className="services-grid" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {similarByText.length > 0 ? (
            similarByText.map((item) => <RadiationCard key={item.id} {...item} />)
          ) : (
            <p>Анализируем контекст...</p>
          )}
        </div>
      </div>
    </div>
  );
};