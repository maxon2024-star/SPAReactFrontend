import { useEffect, useState } from "react";
import type { FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { addToDraft } from "../slices/applicationSlice";
import type { RootState, AppDispatch } from "../store";

const PLANCK_CONSTANT = 6.626e-34;

export const RadiationDetailPage: FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuth } = useSelector((state: RootState) => state.auth);
  const isLoading = useSelector((state: RootState) => state.applications.loading);
  
  const [radiation, setRadiation] = useState<any>(null);
  
  // Параметры формулы
  const [frequency, setFrequency] = useState<number>(5e14);
  const [workFunction, setWorkFunction] = useState<number>(2.0); // в эВ
  
  useEffect(() => {
    // В реальном проекте здесь fetch, для примера имитируем загрузку
    setRadiation({ id: Number(id), name: `Излучение #${id}`, video_url: "", description: "Тестовое излучение" });
  }, [id]);

  // Формула Эйнштейна для фотоэффекта: h*v = A + E_k
  // Переводим работу выхода из эВ в Джоули (1 эВ = 1.6e-19 Дж)
  const workFunctionJ = workFunction * 1.6e-19;
  const photonEnergy = PLANCK_CONSTANT * frequency;
  const kineticEnergy = photonEnergy - workFunctionJ;
  
  // Ток прямо пропорционален кинетической энергии для имитации результата
  const calculatedCurrent = kineticEnergy > 0 ? (kineticEnergy * 1e18) : 0;

  const handleAddToCart = async () => {
    if (!isAuth) {
        navigate('/login');
        return;
    }
    await dispatch(addToDraft({
        radiation_id: Number(id),
        frequency,
        work_function: workFunction,
        current: Number(calculatedCurrent.toFixed(2))
    }));
  };

  if (!radiation) return <div className="app-container">Загрузка данных...</div>;

  return (
    <div className="app-container">
      <BreadCrumbs crumbs={[{ label: 'Все излучения', path: '/' }, { label: radiation.name }]} />

      <div className="vibes-layout">
        <div className="vibes-video-section">
          {/* Контент видео */}
        </div>

        <div className="vibes-form-section p-4" style={{ background: 'white', borderRadius: '12px' }}>
            <h4 className="mb-4">Расчет фотоэффекта</h4>
            <div className="form-field">
                <label>Частота (ν), Гц</label>
                <input type="number" value={frequency} onChange={e => setFrequency(Number(e.target.value))} />
            </div>
            <div className="form-field">
                <label>Работа выхода (A), эВ</label>
                <input type="number" step="0.1" value={workFunction} onChange={e => setWorkFunction(Number(e.target.value))} />
            </div>
            
            <div className="alert alert-info mt-3">
                <strong>Результат:</strong><br/>
                Ток: {calculatedCurrent > 0 ? calculatedCurrent.toFixed(2) : 0} мА
            </div>

            <button 
                className="btn-add-cart" 
                onClick={handleAddToCart}
                disabled={isLoading || calculatedCurrent <= 0}
            >
                {isLoading ? 'Добавление...' : 'Добавить в заявку'}
            </button>
        </div>
      </div>
    </div>
  );
};