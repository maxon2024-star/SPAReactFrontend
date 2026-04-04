export interface RadiationRange {
  id: number;
  name: string;
  description: string;
  image_url: string;
  video_url: string;
}

export const RADIATIONS_MOCK: RadiationRange[] = [
  {
    id: 1,
    name: "Радиоволны",
    description: "Диапазон ЭМИ",
    image_url: "https://images.unsplash.com/photo-1541887089-8d76a5b06602",
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: 2,
    name: "Инфракрасное излучение",
    description: "Тепловое излучение объектов",
    image_url: "", // Пустое поле для проверки дефолтного изображения
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: 3,
    name: "Видимый свет",
    description: "Базовое видимое отраженное излучение",
    image_url: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4"
  }
];

export const CART_MOCK = [
    { id: 1, radiation: RADIATIONS_MOCK[0], area: 10, efficiency: 18 }
];