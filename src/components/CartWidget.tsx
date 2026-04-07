import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../Routes';
import { CART_MOCK } from '../modules/mock';

export const CartWidget: FC = () => {
  return (
    <Link to={ROUTES.CART} className="floating-cart">
      🛒
      <span className="floating-cart-count">{CART_MOCK.length}</span>
    </Link>
  );
};