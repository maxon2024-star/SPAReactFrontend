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

export function useRadiationSearch(initialData: RadiationRange[]) {
  const [items, setItems] = useState<RadiationRange[]>(initialData);
  const [ready, setReady] = useState(false);
  const [models, setModels] = useState<any>(null);

  useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  useEffect(() => {
  const initModels = async () => {
      try {
        const MODEL_ID = 'Xenova/clip-vit-base-patch32';
        
        // Явно указываем использовать легкую квантованную версию
        const options = { dtype: 'q8' } as const;

        // Можно добавить коллбэк, чтобы видеть прогресс загрузки в консоли
        const progressCallback = (info: any) => {
          if (info.status === 'progress') {
            console.log(`Загрузка ${info.file}: ${Math.round(info.progress)}%`);
          }
        };

        const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID);
        const processor = await AutoProcessor.from_pretrained(MODEL_ID);
        
        // Передаем options и progress_callback в тяжелые модели
        const textModel = await CLIPTextModelWithProjection.from_pretrained(MODEL_ID, { 
          ...options, 
          progress_callback: progressCallback 
        });
        const visionModel = await CLIPVisionModelWithProjection.from_pretrained(MODEL_ID, { 
          ...options, 
          progress_callback: progressCallback 
        });
        
        setModels({ tokenizer, processor, textModel, visionModel });
        setReady(true);
      } catch (error) {
        console.error("Ошибка инициализации CLIP:", error);
      }
    };
    initModels();
  }, []);

  const searchByImage = useCallback(async (imageUrl: string) => {
    if (!models || initialData.length === 0) return;

    try {
      const { tokenizer, processor, textModel, visionModel } = models;

      // 1. Получаем эмбеддинг картинки
      const image = await RawImage.read(imageUrl);
      const imageInputs = await processor(image);
      const imageOut = await visionModel(imageInputs);
      
      // Выходной вектор лежит в image_embeds
      const imageEmbedding = Array.from(imageOut.image_embeds.data as Float32Array);

      // 2. Получаем эмбеддинги описаний
      const scoredItems = await Promise.all(
        initialData.map(async (item) => {
          const textInputs = tokenizer(item.description, { padding: true, truncation: true });
          const textOut = await textModel(textInputs);
          
          // Выходной вектор лежит в text_embeds
          const textEmbedding = Array.from(textOut.text_embeds.data as Float32Array);

          // 3. Считаем косинусное сходство
          let dotProduct = 0, normA = 0, normB = 0;
          for (let i = 0; i < imageEmbedding.length; i++) {
            dotProduct += imageEmbedding[i] * textEmbedding[i];
            normA += imageEmbedding[i] * imageEmbedding[i];
            normB += textEmbedding[i] * textEmbedding[i];
          }
          const score = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
          return { ...item, score };
        })
      );

      // Требования: Threshold (от 0.4 до 0.9) и TopK
      // P.S. У CLIP сходство текстов и картинок часто бывает около 0.25-0.35. 
      // Если по порогу 0.4 ничего не находится, временно снизь его для тестов.
      const THRESHOLD = 0.2;
      const TOP_K = 2;

      const filteredAndSorted = scoredItems
        .filter(item => item.score >= THRESHOLD)
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_K);

      console.log("=========================================");
      console.log("🔍 Результаты поиска CLIP по картинке:");
      if (filteredAndSorted.length === 0) {
        console.log("Ничего не найдено (результаты ниже порога Threshold).");
      } else {
        filteredAndSorted.forEach((item, index) => {
          const percentage = (item.score * 100).toFixed(1);
          console.log(`${index + 1}. ${item.name} | Совпадение: ${percentage}% | (Score: ${item.score.toFixed(4)})`);
        });
      }
      console.log("=========================================");

      setItems(filteredAndSorted.map(({ score, ...item }) => item));
    } catch (error) {
      console.error("Ошибка при поиске по изображению:", error);
    }
  }, [models, initialData]);

  const resetSearch = useCallback(() => {
    setItems(initialData);
  }, [initialData]);

  return { items, ready, searchByImage, resetSearch };
}