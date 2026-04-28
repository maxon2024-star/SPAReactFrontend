import type { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToDraft } from "../slices/applicationSlice";
import type { RootState, AppDispatch } from "../store";

interface RadiationCardProps {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  score?: number; // Вернули score для поиска по картинке
}

export const RadiationCard: FC<RadiationCardProps> = ({ id, name, description, image_url, score }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { isAuth } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.applications);

  const handleAdd = () => {
    if (!isAuth) {
      navigate('/login');
      return;
    }
    dispatch(addToDraft({
      radiation_id: id,
      frequency: 1, 
      work_function: 1,
      current: 0 
    }));
  };

  return (
    <div className="card shadow-sm mb-4 h-100 position-relative">
      {/* Если есть score от CLIP, показываем его поверх картинки */}
      {score !== undefined && (
        <div className="position-absolute top-0 end-0 bg-warning px-2 py-1 m-2 rounded text-dark fw-bold" style={{ zIndex: 1 }}>
          ИИ: {(score * 100).toFixed(1)}%
        </div>
      )}

      <img 
        src={image_url || '/placeholder.png'} 
        className="card-img-top" 
        alt={name} 
        style={{ height: '200px', objectFit: 'cover' }} 
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-primary fw-bold">{name}</h5>
        <p className="card-text text-muted mb-4" style={{ flexGrow: 1 }}>
          {description.length > 100 ? `${description.substring(0, 100)}...` : description}
        </p>
        
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <Link to={`/${id}`} className="btn btn-outline-secondary">
            Подробнее
          </Link>
          <button 
            onClick={handleAdd} 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              'Добавить'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};