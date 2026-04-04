import radVideo from '../assets/xray.mp4';

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
    image_url: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?q=80&w=800",
    video_url: radVideo
  },
  {
    id: 2,
    name: "Инфракрасное излучение",
    description: "Тепловое излучение объектов",
    image_url: "", // Пустое поле для проверки дефолтного изображения
    video_url: radVideo
  },
  {
    id: 3,
    name: "Видимый свет",
    description: "Базовое видимое отраженное излучение",
    image_url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800",
    video_url: radVideo
  }
];

export const CART_MOCK = [
    { id: 1, radiation: RADIATIONS_MOCK[0], area: 10, efficiency: 18 }
];