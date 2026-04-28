import type { FC } from 'react';
import { Link } from 'react-router-dom';
import defaultImage from '../assets/image.png';

interface Props {
  id: number;
  name: string;
  short_description?: string;
  description: string;
  image_url: string;
  score?: number; // Данные от CLIP
}

export const RadiationCard: FC<Props> = ({ id, name, short_description, description, image_url, score }) => {
  return (
    <div className="service-card">
        <div className="card-image-wrapper">
            <img src={image_url || defaultImage} alt={name} className="card-image" />
            <div className="card-overlay">
                <Link to={`/${id}`} className="btn-details">👁️ Подробнее</Link>
            </div>
        </div>
        <div className="card-info">
            <h3 className="card-title">{name}</h3>
            
            {/* Вывод процента сходства, если есть данные от CLIP */}
            {score !== undefined && (
                <div className="similarity-badge" style={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                    color: '#4caf50', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginBottom: '10px'
                }}>
                    🔍 Сходство: {(score * 100).toFixed(1)}%
                </div>
            )}

            <div className="card-specs">
                <div className="spec-item">
                    <span className="spec-icon" style={{color:"var(--primary)"}}>⚡</span>
                    {/* Приоритетно выводим краткое описание, фоллбэк на обычное */}
                    <div className="badge-description">
                        {short_description ? short_description : description}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};