import { useEffect, useState } from "react";
import type { FC } from "react";
import { useParams } from "react-router-dom";
import { RADIATIONS_MOCK } from "../modules/mock";
import type { RadiationRange } from "../modules/mock";
import { BreadCrumbs } from "../components/BreadCrumbs";

export const RadiationDetailPage: FC = () => {
  const { id } = useParams();
  const [radiation, setRadiation] = useState<RadiationRange | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const itemRes = await fetch(`/api/radiations/${id}`);
        if (!itemRes.ok) throw new Error();
        const item = await itemRes.json();
        setRadiation(item);
      } catch (err) {
        console.warn("Бэкенд недоступен, работаем с mock-данными", err);
        const item = RADIATIONS_MOCK.find(r => r.id === Number(id));
        setRadiation(item || null);
      }
    };
    loadData();
  }, [id]);

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
    </div>
  );
};