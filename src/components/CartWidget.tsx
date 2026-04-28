// src/components/CartWidget.tsx
import { useEffect } from "react";
import type { FC } from "react";
import { Link } from "react-router-dom";

export const CartWidget: FC = () => {
  useEffect(() => {
    fetch('/api/calculations/draft-summary')
      .then(res => {
        if (!res.ok) throw new Error('Ошибка сети');
        return res.json();
      })
      .catch((err) => {
        console.warn('Бэкенд недоступен', err);
      });
  }, []);

  return (
    <Link 
      to="/cart" 
      className="floating-cart" 
      title="Перейти в корзину"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        backgroundColor: '#0d6efd',
        color: 'white',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '14px'
      }}
    >
      🛒
    </Link>
  );
};