// src/modules/mock.ts
import radVideo from '../assets/xray.mp4';

export interface RadiationRange {
  id: number;
  name: string;
  short_description?: string; 
  description: string;
  image_url: string;
  score?: number;
  video_url?: string;             
}

export const RADIATIONS_MOCK: RadiationRange[] = [
  {
    id: 1,
    name: "Радиоволны",
    description: "Electromagnetic waves with the longest wavelengths, used for long-distance radio communication.",
    image_url: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?q=80&w=800",
    video_url: radVideo
  },
  {
    id: 2,
    name: "Инфракрасное излучение",
    description: "Invisible radiant energy, electromagnetic radiation with longer wavelengths than visible light.",
    image_url: "",
    video_url: radVideo
  },
  {
    id: 3,
    name: "Видимый свет",
    description: "The portion of the electromagnetic spectrum that is visible to the human eye, enabling human sight.",
    image_url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800",
    video_url: radVideo
  }
];

export const CART_MOCK = [
    { id: 1, radiation: RADIATIONS_MOCK[0], area: 10, efficiency: 18 }
];