import type { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToDraft } from "../slices/applicationSlice";
import type { RootState, AppDispatch } from "../store";
import defaultImage from '../assets/DefaultImage.png';

interface RadiationCardProps {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  score?: number; 
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
    
    // Передаем все нужные параметры, включая is_priority
    dispatch(addToDraft({
      radiation_id: id,
      frequency: 1e15, 
      work_function: 2.3,
      area: 10,
      efficiency: 50,
      current: 0,
      is_priority: false
    }));
  };

  return (
    <div className="card shadow-sm mb-4 h-100 position-relative border-0" style={{ boxShadow: 'var(--shadow)' }}>
      {score !== undefined && (
        <div className="similarity-badge shadow-sm">
          ИИ: {(score * 100).toFixed(1)}%
        </div>
      )}

      <img 
        src={image_url || defaultImage} 
        className="card-img-top" 
        alt={name} 
        style={{ height: '200px', objectFit: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }} 
      />
      <div className="card-body d-flex flex-column p-4">
        <h5 className="card-title text-primary fw-bold mb-3">{name}</h5>
        
        <p className="card-text text-muted badge-description mb-4" style={{ flexGrow: 1 }}>
          {description}
        </p>
        
        <div className="d-flex justify-content-between align-items-center mt-auto gap-2">
          <Link to={`/${id}`} className="btn-details flex-grow-1 justify-content-center text-center px-2">
            Подробнее
          </Link>
          <button 
            onClick={handleAdd} 
            className="btn-add flex-grow-1 px-2"
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