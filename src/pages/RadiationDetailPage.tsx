import { useEffect, useState } from "react";
import type { FC } from "react";
import { useParams } from "react-router-dom";
import { RADIATIONS_MOCK } from "../modules/mock";
import type { RadiationRange } from "../modules/mock";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { RadiationCard } from "../components/RadiationCard";
import { 
  env, 
  AutoTokenizer, 
  CLIPTextModelWithProjection 
} from '@xenova/transformers';

env.allowLocalModels = false;

let globalTextModel: any = null;
let globalTokenizer: any = null;
let textInitPromise: Promise<void> | null = null;

export const RadiationDetailPage: FC = () => {
  const { id } = useParams();
  const [radiation, setRadiation] = useState<RadiationRange | null>(null);
  const [allItems, setAllItems] = useState<RadiationRange[]>([]);
  
  const [similarByText, setSimilarByText] = useState<RadiationRange[]>([]);

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

  useEffect(() => {
    if (!radiation || allItems.length === 0) return;
    
    const runTextSim = async () => {
      try {
        if (!globalTextModel) {
          if (!textInitPromise) {
            textInitPromise = (async () => {
              const MODEL_ID = 'Xenova/clip-vit-base-patch32';
              const options = { dtype: 'q8' } as const;

              // === ДОБАВЛЕН ВЫВОД В КОНСОЛЬ ===
              const progressCallback = (info: any) => {
                if (info.status === 'progress') {
                  console.log(`📥 Загрузка ${info.file}: ${Math.round(info.progress)}%`);
                } else if (info.status === 'ready') {
                  console.log(`✅ Модель готова: ${info.file}`);
                }
              };

              globalTokenizer = await AutoTokenizer.from_pretrained(MODEL_ID);
              globalTextModel = await CLIPTextModelWithProjection.from_pretrained(MODEL_ID, {
                ...options,
                progress_callback: progressCallback
              });
            })();
          }
          await textInitPromise;
        }

        const currentInputs = globalTokenizer(radiation.description, { padding: true, truncation: true });
        const currentOut = await globalTextModel(currentInputs);
        const currentVec = Array.from(currentOut.text_embeds.data as Float32Array);

        const scored = [];
        const itemsToScore = allItems.filter(i => i.id !== radiation.id);

        // === ВАЖНО: ПОСЛЕДОВАТЕЛЬНАЯ ОБРАБОТКА ВМЕСТО PROMISE.ALL ===
        // Это спасает от краша WebAssembly (ошибки Failed to fetch)
        for (const item of itemsToScore) {
          const itemInputs = globalTokenizer(item.description, { padding: true, truncation: true });
          const itemOut = await globalTextModel(itemInputs);
          const itemVec = Array.from(itemOut.text_embeds.data as Float32Array);
          
          let dotProduct = 0, normA = 0, normB = 0;
          for (let i = 0; i < currentVec.length; i++) {
            dotProduct += currentVec[i] * itemVec[i];
            normA += currentVec[i] * currentVec[i];
            normB += itemVec[i] * itemVec[i];
          }
          const score = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
          scored.push({ item, score });
        }

        const sortedScores = scored.sort((a, b) => b.score - a.score);

        console.log(`=== Похожие для: ${radiation.name} ===`);
        sortedScores.forEach(s => {
          console.log(`${s.item.name} | Сходство: ${(s.score * 100).toFixed(2)}% | Score: ${s.score.toFixed(4)}`);
        });

        setSimilarByText(sortedScores.slice(0, 3).map(s => s.item));

      } catch (e) {
        console.error("Ошибка текстового ИИ:", e);
      }
    };
    
    runTextSim();
  }, [radiation, allItems]);

  if (!radiation) return <div className="app-container">Загрузка данных...</div>;

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