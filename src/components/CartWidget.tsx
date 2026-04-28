import type { FC } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { ROUTES } from "../Routes";

export const CartWidget: FC = () => {
  // Берем ID черновика прямо из Redux (никаких лишних запросов!)
  const draftId = useSelector((state: RootState) => state.applications.draftId);

  return (
    <Link 
      to={draftId ? `${ROUTES.CALCULATIONS}/${draftId}` : '#'} 
      className="floating-cart" 
      title={draftId ? "Перейти в черновик" : "Корзина пуста"}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        backgroundColor: draftId ? '#0d6efd' : '#6c757d',
        color: 'white',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '14px',
        pointerEvents: draftId ? 'auto' : 'none' // Отключаем клик, если черновика нет
      }}
    >
      🛒
    </Link>
  );
};