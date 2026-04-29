import { useState, useEffect, useCallback } from 'react';
import { 
  env, 
  AutoTokenizer, 
  AutoProcessor, 
  CLIPTextModelWithProjection, 
  CLIPVisionModelWithProjection,
  RawImage 
} from '@xenova/transformers';
import type { RadiationRange } from '../modules/mock';

env.allowLocalModels = false;

// ==========================================
// ГЛОБАЛЬНЫЙ КЭШ МОДЕЛЕЙ (Паттерн Singleton)
// ==========================================
let globalModels: any = null;
let initPromise: Promise<void> | null = null;

export function useRadiationSearch(initialData: RadiationRange[]) {
  const [items, setItems] = useState<RadiationRange[]>(initialData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  useEffect(() => {
    const initModels = async () => {
      if (globalModels) {
        setReady(true);
        return;
      }

      if (initPromise) {
        await initPromise;
        if (globalModels) setReady(true);
        return;
      }

      initPromise = (async () => {
        try {
          const MODEL_ID = 'Xenova/clip-vit-base-patch32';
          const options = { dtype: 'q8' } as const;

          // ==========================================
          // ПОДРОБНЫЕ ЛОГИ ЗАГРУЗКИ
          // ==========================================
          const progressCallback = (info: any) => {
            if (info.status === 'progress') {
              console.log(`📥 [CLIP] Загрузка ${info.file}: ${Math.round(info.progress)}%`);
            } else if (info.status === 'ready') {
              console.log(`✅ [CLIP] Компонент готов: ${info.file}`);
            }
          };

          const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID);
          const processor = await AutoProcessor.from_pretrained(MODEL_ID);
          
          // Передаем options и прогресс-коллбэк
          const textModel = await CLIPTextModelWithProjection.from_pretrained(MODEL_ID, {
            ...options,
            progress_callback: progressCallback
          });
          const visionModel = await CLIPVisionModelWithProjection.from_pretrained(MODEL_ID, {
            ...options,
            progress_callback: progressCallback
          });
          
          globalModels = { tokenizer, processor, textModel, visionModel };
          console.log("🚀 [CLIP] Все модели успешно загружены в память!");
        } catch (error) {
          console.error("❌ Ошибка инициализации CLIP:", error);
          // Сбрасываем промис при обрыве сети, чтобы не зависнуть навсегда
          initPromise = null; 
        }
      })();

      await initPromise;
      if (globalModels) {
        setReady(true);
      }
    };

    initModels();
  }, []);

  const searchByImage = useCallback(async (imageUrl: string) => {
    if (!globalModels || initialData.length === 0) return;

    try {
      const { tokenizer, processor, textModel, visionModel } = globalModels;

      console.log("🖼️ Начинаем анализ картинки...");
      const image = await RawImage.read(imageUrl);
      const imageInputs = await processor(image);
      const imageOut = await visionModel(imageInputs);
      const imageEmbedding = Array.from(imageOut.image_embeds.data as Float32Array);

      console.log("📝 Сравниваем с описаниями услуг...");
      const scoredItems = [];

      // ========================================================
      // ИСПРАВЛЕНИЕ: ПОСЛЕДОВАТЕЛЬНЫЙ ЦИКЛ ВМЕСТО PROMISE.ALL
      // WebAssembly не зависнет!
      // ========================================================
      for (const item of initialData) {
        const textInputs = tokenizer(item.description, { padding: true, truncation: true });
        const textOut = await textModel(textInputs);
        const textEmbedding = Array.from(textOut.text_embeds.data as Float32Array);

        let dotProduct = 0, normA = 0, normB = 0;
        for (let i = 0; i < imageEmbedding.length; i++) {
          dotProduct += imageEmbedding[i] * textEmbedding[i];
          normA += imageEmbedding[i] * imageEmbedding[i];
          normB += textEmbedding[i] * textEmbedding[i];
        }
        const score = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        scoredItems.push({ ...item, score });
      }

      const THRESHOLD = 0.2;
      const TOP_K = 2;

      const filteredAndSorted = scoredItems
        .filter(item => item.score >= THRESHOLD)
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_K);

      // ==========================================
      // ПОДРОБНЫЕ ЛОГИ РЕЗУЛЬТАТОВ ПОИСКА
      // ==========================================
      console.log("=========================================");
      console.log("🔍 Результаты поиска CLIP по картинке:");
      if (filteredAndSorted.length === 0) {
        console.log("⚠️ Ничего не найдено (результаты ниже порога Threshold).");
      } else {
        filteredAndSorted.forEach((item, index) => {
          const percentage = (item.score * 100).toFixed(1);
          console.log(`🏆 ${index + 1}. ${item.name} | Совпадение: ${percentage}% | (Score: ${item.score.toFixed(4)})`);
        });
      }
      console.log("=========================================");

      setItems(filteredAndSorted as any);
    } catch (error) {
      console.error("❌ Ошибка при поиске по изображению:", error);
    }
  }, [initialData]);

  const resetSearch = useCallback(() => {
    setItems(initialData);
  }, [initialData]);

  return { items, ready, searchByImage, resetSearch };
}