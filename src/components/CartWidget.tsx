import { useState, useEffect } from "react";
import type { FC } from "react";
import { CART_MOCK } from "../modules/mock";

export const CartWidget: FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch('/api/calculations/draft-summary')
      .then(res => {
        if (!res.ok) throw new Error('Ошибка сети');
        return res.json();
      })
      .then(data => setCount(data.count))
      .catch((err) => {
        console.warn('Бэкенд недоступен, используем mock для корзины:', err);
        setCount(CART_MOCK.length);
      });
  }, []);

  return (
    <div className="cart-widget" style={{ padding: '8px 16px', background: '#f0f0f0', borderRadius: '8px', fontWeight: 'bold' }}>
      🛒 Корзина: {count}
    </div>
  );
};