import { useState, useEffect, useCallback } from 'react';
import { pipeline, env } from '@xenova/transformers';
import type { RadiationRange } from '../modules/mock';

// Загружаем напрямую из Hugging Face
env.allowLocalModels = false;

export function useRadiationSearch(initialData: RadiationRange[]) {
  const [items, setItems] = useState<RadiationRange[]>(initialData);
  const [ready, setReady] = useState(false);
  const [visionModel, setVisionModel] = useState<any>(null);
  const [textModel, setTextModel] = useState<any>(null);

  // Синхронизация с бэкендом
  useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  useEffect(() => {
    const initModels = async () => {
      try {
        // Загружаем CLIP для обработки текста и изображений
        const textPipe = await pipeline('feature-extraction', 'Xenova/clip-vit-base-patch32');
        const visionPipe = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32');
        
        setTextModel(() => textPipe);
        setVisionModel(() => visionPipe);
        setReady(true);
      } catch (error) {
        console.error("Ошибка инициализации CLIP:", error);
      }
    };
    initModels();
  }, []);

  const searchByImage = useCallback(async (imageUrl: string) => {
    if (!visionModel || !textModel || initialData.length === 0) return;

    try {
      // 1. Получаем эмбеддинг загруженной картинки
      const imageOut = await visionModel(imageUrl);
      const imageEmbedding = Array.from(imageOut.data as Float32Array);

      // 2. Получаем эмбеддинги описаний и сравниваем
      const scoredItems = await Promise.all(
        initialData.map(async (item) => {
          const textOut = await textModel(item.description, { pooling: 'mean', normalize: true });
          const textEmbedding = Array.from(textOut.data as Float32Array);

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

      // 3. Сортируем по релевантности (убыванию сходства)
      scoredItems.sort((a, b) => b.score - a.score);
      setItems(scoredItems.map(({ score, ...item }) => item));
    } catch (error) {
      console.error("Ошибка при поиске по изображению:", error);
    }
  }, [visionModel, textModel, initialData]);

  const resetSearch = useCallback(() => {
    setItems(initialData);
  }, [initialData]);

  return { items, ready, searchByImage, resetSearch };
}