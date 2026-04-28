import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { fetchDraftSummary } from '../slices/applicationSlice';
import { apiClient } from '../api/axios';
import type { AppDispatch } from '../store';
import { ROUTES } from '../Routes';

// --- Константы и физика из твоего старого Go-шаблона ---
const H_PLANK = 6.626e-34;
const E_CHARGE = 1.6e-19;
const P_DENSITY = 100.0;

const calculatePhysics = (freq: number, wf: number, area: number, eff: number) => {
  if (!freq || freq <= 0) return { ek: 0, current: -2 };
  
  const ePhotonJ = H_PLANK * freq;
  const wfJ = wf * E_CHARGE;
  const ekJ = ePhotonJ - wfJ;
  
  if (ekJ <= 0) return { ek: 0, current: -1 };

  const areaM2 = area * 1e-4;
  const powerW = P_DENSITY * areaM2;
  const nPhotons = powerW / ePhotonJ;
  const nElectrons = nPhotons * (eff / 100.0);
  const currentA = nElectrons * E_CHARGE;
  
  return { ek: ekJ / E_CHARGE, current: currentA * 1000 };
};

// --- Основная страница ---
export const CalculationDetailPage: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const [calcData, setCalcData] = useState<any>(null);
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCalculation = async () => {
    try {
      const res = await apiClient.get(`/api/calculations/${id}`);
      setCalcData(res.data);
      
      const items = res.data.items || res.data.Items || [];
      // Инициализируем локальный стейт, чтобы формулы реагировали на каждое нажатие
      setLocalItems(items.map((item: any) => ({
        ...item,
        localFreq: item.frequency ?? item.Frequency ?? 0,
        localWf: item.work_function ?? item.WorkFunction ?? 0,
        localArea: item.area ?? item.Area ?? 0,
        localEff: item.efficiency ?? item.Efficiency ?? 0,
      })));
    } catch (e) {
      console.error(e);
      navigate(ROUTES.CALCULATIONS); 
    }
  };

  useEffect(() => {
    loadCalculation();
  }, [id]);

  const handleFieldChange = (idx: number, field: string, val: string) => {
    setLocalItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleUpdateItem = async (idx: number) => {
    const item = localItems[idx];
    const radiationId = item.radiation_id ?? item.RadiationID ?? item.radiation?.id ?? item.Radiation?.ID;
    const itemId = item.id ?? item.ID;
    const calcId = item.calculation_id ?? item.CalculationID;

    const payload = {
      item_id: Number(itemId) || 0,
      calc_id: Number(calcId) || 0,
      radiation_id: Number(radiationId) || 0,
      frequency: Number(item.localFreq) || 0,
      work_function: Number(item.localWf) || 0,
      area: Number(item.localArea) || 0,
      efficiency: Number(item.localEff) || 0
    };

    setLoading(true);
    try {
      await apiClient.put('/api/calculation-items', payload);
      // Данные уже подсчитаны локально, поэтому просто убираем лоадер
    } catch (err: any) {
      console.error(err);
      alert("Ошибка обновления: Проверьте введенные данные (возможно число слишком большое)");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (radiationId: number) => {
    setLoading(true);
    try {
      await apiClient.delete(`/api/calculation-items?radiation_id=${radiationId}`);
      await loadCalculation();
      dispatch(fetchDraftSummary());
    } catch (err) {
      console.error(err);
      alert("Ошибка при удалении.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCalculation = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить всю заявку?')) return;
    setLoading(true);
    await apiClient.delete(`/api/calculations/${id}`);
    dispatch(fetchDraftSummary());
    navigate(ROUTES.CALCULATIONS);
  };

  const handleFormCalculation = async () => {
    setLoading(true);
    await apiClient.put(`/api/calculations/${id}/form`);
    dispatch(fetchDraftSummary());
    navigate(ROUTES.CALCULATIONS);
  };

  // Динамический пересчет общего тока фотоэффекта
  const totalCurrentDisplay = useMemo(() => {
    let sum = 0;
    localItems.forEach(item => {
      const { current } = calculatePhysics(Number(item.localFreq), Number(item.localWf), Number(item.localArea), Number(item.localEff));
      if (current > 0) sum += current;
    });
    return sum;
  }, [localItems]);

  if (!calcData) return <div className="app-container py-5 text-center">Загрузка заявки...</div>;

  const status = calcData.status || calcData.Status;
  const isDraft = status === 'draft';

  return (
    <div className="app-container">
      <BreadCrumbs crumbs={[
        { label: 'Все расчеты', path: ROUTES.CALCULATIONS }, 
        { label: `Заявка #${id}` }
      ]} />
      
      <div className="bg-white p-4 rounded shadow-sm mt-3">
        <h3 className="mb-4 text-dark border-bottom pb-2">
          Оформление заявки #{id} <span className="fs-5 text-muted">(Статус: {status})</span>
        </h3>
        
        {localItems.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table table-hover table-bordered mt-3">
                <thead className="table-light text-center align-middle">
                  <tr>
                    <th>Фото</th>
                    <th>Диапазон</th>
                    <th>Частота (Гц)</th>
                    <th>Авых (эВ)</th>
                    <th>S (см²)</th>
                    <th>КПД (%)</th>
                    <th className="text-info">Eк (эВ)</th>
                    <th>Ток (мА)</th>
                    {isDraft && <th>Действия</th>}
                  </tr>
                </thead>
                <tbody>
                  {localItems.map((item, idx) => {
                    const radiation = item.radiation || item.Radiation || {};
                    const radiationId = item.radiation_id ?? item.RadiationID ?? radiation.id ?? radiation.ID;
                    
                    // Локальный физический расчет для каждой строки
                    const { ek, current } = calculatePhysics(
                      Number(item.localFreq), 
                      Number(item.localWf), 
                      Number(item.localArea), 
                      Number(item.localEff)
                    );

                    let currentDisplay;
                    if (current < 0) {
                      if (current === -1) {
                        currentDisplay = <span className="text-danger small fw-bold">hν &lt; A<br/>(Нет эффекта)</span>;
                      } else {
                        currentDisplay = <span className="text-danger small fw-bold">Неверная<br/>частота</span>;
                      }
                    } else {
                      currentDisplay = <span className="fw-bold">{current.toFixed(3)}</span>;
                    }

                    return (
                      <tr key={idx} className="align-middle text-center">
                        <td>
                          <img 
                            src={radiation.image_url || radiation.ImageURL || 'https://via.placeholder.com/60'} 
                            alt="img" 
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} 
                          />
                        </td>
                        <td className="text-start fw-bold text-primary">
                          {radiation.name || radiation.Name || `ID: ${radiationId}`}
                        </td>
                        <td>
                          <input 
                            type="number" className="form-control form-control-sm text-center mx-auto" style={{ width: '100px' }}
                            value={item.localFreq} onChange={e => handleFieldChange(idx, 'localFreq', e.target.value)} step="any" disabled={!isDraft || loading}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="form-control form-control-sm text-center mx-auto" style={{ width: '80px' }}
                            value={item.localWf} onChange={e => handleFieldChange(idx, 'localWf', e.target.value)} step="any" disabled={!isDraft || loading}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="form-control form-control-sm text-center mx-auto" style={{ width: '70px' }}
                            value={item.localArea} onChange={e => handleFieldChange(idx, 'localArea', e.target.value)} step="0.1" disabled={!isDraft || loading}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="form-control form-control-sm text-center mx-auto" style={{ width: '70px' }}
                            value={item.localEff} onChange={e => handleFieldChange(idx, 'localEff', e.target.value)} step="0.1" disabled={!isDraft || loading}
                          />
                        </td>
                        <td className="fw-bold text-info">
                          {ek > 0 ? ek.toFixed(2) : "0.00"}
                        </td>
                        <td>{currentDisplay}</td>
                        {isDraft && (
                          <td>
                            <div className="d-flex gap-2 justify-content-center">
                              <button 
                                className="btn btn-sm btn-outline-primary" title="Сохранить изменения" disabled={loading}
                                onClick={() => handleUpdateItem(idx)}
                              >
                                🔄
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger" title="Удалить диапазон" disabled={loading}
                                onClick={() => handleRemoveItem(radiationId)}
                              >
                                ✖
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="alert alert-primary mt-4 d-flex justify-content-between align-items-center">
              <h4 className="mb-0 text-primary">Общий ток фотоэффекта:</h4>
              <h3 className="mb-0 fw-bold">{totalCurrentDisplay.toFixed(3)} мА</h3>
            </div>

            {isDraft && (
              <div className="d-flex gap-3 mt-4">
                <button 
                  className="btn btn-outline-danger w-50 py-2 fw-bold" 
                  onClick={handleDeleteCalculation} 
                  disabled={loading}
                >
                  🗑 Удалить заявку
                </button>
                <button 
                  className="btn btn-success w-50 py-2 fw-bold" 
                  onClick={handleFormCalculation} 
                  disabled={loading}
                >
                  ✅ Отправить на модерацию
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5 text-muted bg-light rounded border">
            <div className="fs-1 mb-3">🛒</div>
            <h5>Ваша заявка пока пуста.</h5>
            <p>Добавьте диапазоны излучения из каталога.</p>
            <Link to="/" className="btn btn-primary mt-2 px-4">
              Перейти в каталог
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};