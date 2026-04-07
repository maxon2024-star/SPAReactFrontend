import type { FC } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../Routes";
import { BreadCrumbs } from "../components/BreadCrumbs";

export const HomePage: FC = () => {
  return (
    <div className="app-container">
      <BreadCrumbs crumbs={[]} />
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '20px' }}>
          ⚡ Лаборатория квантовой физики
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          Добро пожаловать в специализированный сервис! Наш профиль — профессиональный расчет параметров внешнего фотоэффекта для различных материалов. 
          Вы можете изучить каталог доступных металлов и типов излучений, выбрать подходящие услуги и отправить заявку на детальный расчет (работы выхода, кинетической энергии электронов и красной границы).
        </p>
        <Link to={ROUTES.RADIATIONS} className="btn-details" style={{ fontSize: '1.2rem', padding: '15px 30px' }}>
          Перейти к списку услуг
        </Link>
      </div>
    </div>
  );
};