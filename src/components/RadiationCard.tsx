import type { FC } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RadiationRange } from "../modules/mock";
import { addToDraft } from "../slices/applicationSlice";
import { RootState } from "../store";

interface RadiationCardProps extends RadiationRange {
  score?: number; // Для ИИ CLIP
}

export const RadiationCard: FC<RadiationCardProps> = ({ id, name, description, image_url, score }) => {
  const dispatch = useDispatch();
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);

  const handleAdd = () => {
    // Вносим услугу в новую/текущую заявку с дефолтными параметрами М-М
    dispatch(addToDraft({
      radiation_id: id,
      area: 1,
      efficiency: 1,
      frequency: 1,
      work_function: 1
    }) as any);
  };

  return (
    <div className="service-card radiation-card">
      {/* Если есть score от CLIP, показываем его */}
      {score !== undefined && (
        <div className="similarity-badge">
          ИИ: {(score * 100).toFixed(1)}%
        </div>
      )}
      <div className="service-icon">
        <img src={image_url || '/placeholder.png'} alt={name} style={{ width: '100%', borderRadius: '8px' }} />
      </div>
      <div className="radiation-card-content mt-2">
        <h3 className="service-title">{name}</h3>
        <p className="service-desc">{description.substring(0, 80)}...</p>
      </div>
      <div className="card-actions">
        <Link to={`/radiations/${id}`} className="btn-details" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Подробнее
        </Link>
        {isAuth && (
          <button onClick={handleAdd} className="btn btn-primary btn-sm">
            Добавить
          </button>
        )}
      </div>
    </div>
  );
};