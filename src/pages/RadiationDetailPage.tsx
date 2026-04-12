import { useEffect, useState } from "react";
import type { FC } from "react";
import { useParams } from "react-router-dom";
import { RADIATIONS_MOCK } from "../modules/mock";
import type { RadiationRange } from "../modules/mock";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { RadiationCard } from "../components/RadiationCard";
import { pipeline, env } from '@xenova/transformers';

// Отключаем локальные модели для загрузки прямо из HF
env.allowLocalModels = false;

// Вспомогательная функция для косинусного сходства
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const RadiationDetailPage: FC = () => {
  const { id } = useParams();
  const [radiation, setRadiation] = useState<RadiationRange | null>(null);
  
  // Состояния для CLIP
  const [similarItems, setSimilarItems] = useState<RadiationRange[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 1. Загрузка услуги
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/radiations/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRadiation(data);
      } catch (err) {
        console.warn("Бэкенд недоступен, fallback на mock", err);
        const item = RADIATIONS_MOCK.find(r => r.id === parseInt(id));
        if (item) setRadiation(item);
      }
    };
    fetchItem();
  }, [id]);

  // 2. Логика CLIP для поиска похожих (работает после загрузки услуги)
  useEffect(() => {
    const findSimilar = async () => {
      if (!radiation) return;
      setIsAiLoading(true);

      try {
        // Инициализируем модель генерации эмбеддингов
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

        // Получаем все данные для сравнения
        let allItems: RadiationRange[] = [];
        try {
          const res = await fetch('/api/radiations');
          if (!res.ok) throw new Error();
          allItems = await res.json();
        } catch {
          allItems = RADIATIONS_MOCK;
        }

        // Исключаем текущий элемент
        const others = allItems.filter(r => r.id !== radiation.id);

        // Получаем эмбеддинг для описания текущей услуги
        const outCurrent = await extractor(radiation.description, { pooling: 'mean', normalize: true });
        const currentEmbedding = Array.from(outCurrent.data as Float32Array);

        // Получаем эмбеддинги для остальных и считаем score
        const scoredItems = await Promise.all(others.map(async (item) => {
          const out = await extractor(item.description, { pooling: 'mean', normalize: true });
          const itemEmbedding = Array.from(out.data as Float32Array);
          const score = cosineSimilarity(currentEmbedding, itemEmbedding);
          return { item, score };
        }));

        // Сортируем по убыванию сходства и берём топ-3
        scoredItems.sort((a, b) => b.score - a.score);
        setSimilarItems(scoredItems.slice(0, 3).map(s => s.item));

      } catch (e) {
        console.error("Ошибка при работе CLIP модели", e);
      } finally {
        setIsAiLoading(false);
      }
    };

    findSimilar();
  }, [radiation]);

  if (!radiation) return <div>Загрузка...</div>;

  return (
    <div className="app-container">
      <BreadCrumbs crumbs={[{ label: radiation.name }]} />

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

      {/* Блок похожих услуг (CLIP) */}
      <div className="similar-radiations-section" style={{ marginTop: '2rem' }}>
        <h3>Похожие излучения (AI рекомендации):</h3>
        {isAiLoading ? (
          <p>Анализируем описания через нейросеть...</p>
        ) : (
          <div className="services-grid" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {similarItems.length > 0 ? (
              similarItems.map((item) => (
                <RadiationCard key={item.id} {...item} />
              ))
            ) : (
              <p>Похожих элементов не найдено</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};