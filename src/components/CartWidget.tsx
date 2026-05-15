import type { FC } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { ROUTES } from "../Routes";

export const CartWidget: FC = () => {
  const draftId = useSelector((state: RootState) => state.applications.draftId);
  const itemsCount = useSelector((state: RootState) => state.applications.currentApp?.items?.length || 0);
  
  // Если черновика нет, виджет можно вообще скрыть (или оставить серым)
  if (!draftId) return null; 

  return (
    <Link 
      to={`${ROUTES.CALCULATIONS}/${draftId}`}
      className="floating-cart shadow" 
      title="Перейти в корзину"
      style={{
        position: 'fixed',
        bottom: '30px', // Отступ снизу экрана
        right: '30px',  // Отступ справа экрана
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#0d6efd',
        color: 'white',
        textDecoration: 'none',
        fontSize: '24px',
        zIndex: 1050
      }}
    >
      🛒
      {/* Индикация числа услуг (красный кружок сверху) */}
      {itemsCount > 0 && (
        <span 
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
          style={{ fontSize: '14px', padding: '0.4em 0.6em' }}
        >
          {itemsCount}
        </span>
      )}
    </Link>
  );
};