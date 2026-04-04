import { useEffect, useState } from "react";
import type { FC } from "react";
import { useParams } from "react-router-dom";
import { RADIATIONS_MOCK } from "../modules/mock";
import type { RadiationRange } from "../modules/mock";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { ROUTES, ROUTE_LABELS } from "../Routes";

export const RadiationDetailPage: FC = () => {
  const { id } = useParams();
  const [radiation, setRadiation] = useState<RadiationRange>();

  useEffect(() => {
    if (id) {
      const item = RADIATIONS_MOCK.find(r => r.id === parseInt(id));
      setRadiation(item);
    }
  }, [id]);

  if (!radiation) return <div>Загрузка...</div>;

  return (
    <div className="app-container">
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.RADIATIONS, path: ROUTES.RADIATIONS },
          { label: radiation.name },
        ]}
      />

      <div className="detail-container-vibes" style={{display: 'flex', justifyContent: 'center'}}>
        <div className="vibes-video-section">
          {/* Видео */}
          <video autoPlay loop muted playsInline className="tiktok-video">
              <source src={radiation.video_url} type="video/mp4" />
          </video>
          
          {/* Текст поверх видео снизу */}
          <div className="vibes-video-overlay">
              <h2 className="video-title">{radiation.name}</h2>
              <p className="video-description">{radiation.description}</p>
          </div>

          {/* TikTok-кнопка добавления в корзину */}
          <button 
            className="tiktok-like-btn" 
            onClick={() => alert('Добавлено в заявку!')}
            title="Добавить в корзину"
          >
            ➕
          </button>
        </div>
      </div>
    </div>
  );
};