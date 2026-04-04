import type { FC } from "react";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { ROUTE_LABELS } from "../Routes";
import { CART_MOCK } from "../modules/mock";

export const CartPage: FC = () => {
  return (
    <div className="app-container">
      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.CART }]} />
      <h2 className="section-title">Текущая заявка</h2>
      
      {CART_MOCK.length > 0 ? (
        <div className="cart-table-wrapper">
            <div className="cart-table-inner">
                <div className="table-header" style={{display: 'grid', gridTemplateColumns: '100px 1fr 100px 100px', gap: '10px'}}>
                    <div>Фото</div>
                    <div>Диапазон</div>
                    <div>S (см²)</div>
                    <div>КПД (%)</div>
                </div>
                {CART_MOCK.map((item) => (
                    <div className="item-card" key={item.id} style={{display: 'grid', gridTemplateColumns: '100px 1fr 100px 100px', gap: '10px', alignItems: 'center'}}>
                        <img src={item.radiation.image_url} alt="" style={{width: '60px', borderRadius: '8px'}} />
                        <div style={{fontWeight: 'bold'}}>{item.radiation.name}</div>
                        <div>{item.area}</div>
                        <div>{item.efficiency}</div>
                    </div>
                ))}
            </div>
        </div>
      ) : (
        <div className="empty-cart">🛒 Заявка пуста</div>
      )}
    </div>
  );
};