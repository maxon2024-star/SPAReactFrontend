import type { FC } from 'react';
import { Link } from 'react-router-dom';
import defaultImage from '../assets/image.png';

interface Props {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

export const RadiationCard: FC<Props> = ({ id, name, description, image_url }) => {
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
            <div className="card-specs">
                <div className="spec-item">
                    <span className="spec-icon" style={{color:"var(--primary)"}}>⚡</span>
                    <div className="badge-description">{description}</div>
                </div>
            </div>
        </div>
    </div>
  );
};