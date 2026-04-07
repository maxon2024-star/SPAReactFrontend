import type { FC } from 'react';
import { CART_MOCK } from '../modules/mock';

export const CartWidget: FC = () => {
  return (
    <div className="floating-cart" style={{ cursor: 'default' }}>
      🛒
      <span className="floating-cart-count">{CART_MOCK.length}</span>
    </div>
  );
};