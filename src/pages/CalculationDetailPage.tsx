import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { 
  fetchCalculationById, updateDraftItem, removeFromDraft, 
  updateCalculationFields, formDraft, deleteCalculation 
} from '../slices/applicationSlice';
import type { RootState, AppDispatch } from '../store';
import { ROUTES } from '../Routes';

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

export const CalculationDetailPage: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { currentApp, loading } = useSelector((state: RootState) => state.applications);
  
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (id) dispatch(fetchCalculationById(Number(id)));
  }, [id, dispatch]);

  useEffect(() => {
    if (currentApp) {
      setTheme(currentApp.theme || currentApp.Theme || '');
      setDescription(currentApp.description || currentApp.Description || '');
      
      const items = currentApp.items || currentApp.Items || [];
      setLocalItems(items.map((item: any) => ({
        ...item,
        localFreq: item.frequency ?? item.Frequency ?? 0,
        localWf: item.work_function ?? item.WorkFunction ?? 0,
        localArea: item.area ?? item.Area ?? 0,
        localEff: item.efficiency ?? item.Efficiency ?? 0,
        localIsPriority: item.is_priority ?? item.IsPriority ?? false, // СТЕЙТ ГАЛОЧКИ ДЛЯ КАЖДОГО М-М
      })));
    }
  }, [currentApp]);

  const handleFieldChange = (idx: number, field: string, val: any) => {
    setLocalItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  // МЕТОД 1: Сохранить М-М
  const handleUpdateItem = async (idx: number) => {
    const item = localItems[idx];
    const radiationId = item.radiation_id ?? item.RadiationID ?? item.radiation?.id ?? item.Radiation?.ID;
    
    const freq = Number(item.localFreq) || 0;
    const wf = Number(item.localWf) || 0;
    const ar = Number(item.localArea) || 0;
    const eff = Number(item.localEff) || 0;
    const { current } = calculatePhysics(freq, wf, ar, eff);

    const payload = {
      item_id: Number(item.id ?? item.ID) || 0,
      calc_id: Number(id) || 0,
      radiation_id: Number(radiationId) || 0,
      frequency: freq,
      work_function: wf,
      area: ar,
      efficiency: eff,
      is_priority: Boolean(item.localIsPriority), // Передаем галочку в API
      current: current > 0 ? current : 0
    };
    
    await dispatch(updateDraftItem({ appId: Number(id), input: payload }));
  };

  // МЕТОД 2: Удалить М-М
  const handleRemoveItem = async (radiationId: number) => {
    await dispatch(removeFromDraft({ appId: Number(id), radiationId }));
  };

  // МЕТОД 3: Сохранить поля заявки
  const handleSaveDraftFields = async () => {
    await dispatch(updateCalculationFields({ 
      id: Number(id), 
      theme, 
      description,
      total_current: totalCurrentDisplay 
    }));
  };

  // МЕТОД 4: Отправить
  const handleFormCalculation = async () => {
    await dispatch(formDraft(Number(id)));
    navigate(ROUTES.CALCULATIONS);
  };

  // МЕТОД 5: Удалить заявку
  const handleDeleteCalculation = async () => {
    if (!window.confirm('Удалить заявку?')) return;
    await dispatch(deleteCalculation(Number(id)));
    navigate(ROUTES.CALCULATIONS);
  };

  const totalCurrentDisplay = useMemo(() => {
    let sum = 0;
    localItems.forEach(item => {
      const { current } = calculatePhysics(Number(item.localFreq), Number(item.localWf), Number(item.localArea), Number(item.localEff));
      if (current > 0) sum += current;
    });
    return sum;
  }, [localItems]);

  if (!currentApp && loading) return <div className="text-center py-5">Загрузка заявки...</div>;
  if (!currentApp) return <div className="text-center py-5">Заявка не найдена</div>;

  const status = currentApp.status || currentApp.Status;
  const isDraft = status === 'draft';

  return (
    <div className="app-container position-relative">
      {loading && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      <BreadCrumbs crumbs={[{ label: 'Все расчеты', path: ROUTES.CALCULATIONS }, { label: `Заявка #${id}` }]} />
      
      <div className="bg-white p-4 rounded shadow-sm mt-3 border">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <h3 className="mb-0 text-dark">
            Оформление заявки #{id} <span className="badge bg-secondary ms-2">{status}</span>
          </h3>
        </div>
        
        {isDraft && (
          <div className="row g-3 mb-4 p-3 bg-light rounded border border-light">
            <div className="col-md-5">
              <label className="fw-bold small text-muted">ТЕМА ЗАЯВКИ:</label>
              <input type="text" className="form-control form-control-sm" value={theme} onChange={(e) => setTheme(e.target.value)} disabled={loading} />
            </div>
            <div className="col-md-5">
              <label className="fw-bold small text-muted">ОПИСАНИЕ:</label>
              <input type="text" className="form-control form-control-sm" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} />
            </div>
            <div className="col-md-2 d-flex align-items-end">
               <button className="btn btn-sm btn-primary w-100 fw-bold" onClick={handleSaveDraftFields} disabled={loading}>💾 СОХРАНИТЬ ПОЛЯ</button>
            </div>
          </div>
        )}
        
        {localItems.length > 0 ? (
          <>
            <div className="row mx-0 px-2 mb-2 d-none d-md-flex align-items-center fw-bold text-muted text-uppercase text-center" style={{ fontSize: '11px' }}>
              <div className="col-3 text-start">Диапазон</div>
              <div className="col-1 px-1">Гц</div>
              <div className="col-1 px-1">Авых</div>
              <div className="col-1 px-1">S</div>
              <div className="col-1 px-1">КПД</div>
              <div className="col-1 px-1">Срочно</div>
              <div className="col-1 px-1">Ток (мА)</div>
              {isDraft && <div className="col-3 text-end">Действия</div>}
            </div>

            <div className="d-flex flex-column gap-2 mb-4">
              {localItems.map((item, idx) => {
                const radiation = item.radiation || item.Radiation || {};
                const radiationId = item.radiation_id ?? item.RadiationID ?? radiation.id ?? radiation.ID;
                const { current } = calculatePhysics(Number(item.localFreq), Number(item.localWf), Number(item.localArea), Number(item.localEff));

                return (
                  <div key={idx} className="card border-0 shadow-sm py-2 bg-light">
                    <div className="row mx-0 px-2 align-items-center">
                      <div className="col-3 d-flex align-items-center gap-2">
                        <img src={radiation.image_url || radiation.ImageURL || 'https://via.placeholder.com/40'} alt="img" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span className="fw-bold text-primary text-truncate" style={{ fontSize: '14px' }}>
                          {radiation.name || radiation.Name || `ID: ${radiationId}`}
                        </span>
                      </div>
                      <div className="col-1 px-1"><input type="number" className="form-control form-control-sm text-center px-1" value={item.localFreq} onChange={e => handleFieldChange(idx, 'localFreq', e.target.value)} disabled={!isDraft || loading} /></div>
                      <div className="col-1 px-1"><input type="number" className="form-control form-control-sm text-center px-1" value={item.localWf} onChange={e => handleFieldChange(idx, 'localWf', e.target.value)} disabled={!isDraft || loading} /></div>
                      <div className="col-1 px-1"><input type="number" className="form-control form-control-sm text-center px-1" value={item.localArea} onChange={e => handleFieldChange(idx, 'localArea', e.target.value)} disabled={!isDraft || loading} /></div>
                      <div className="col-1 px-1"><input type="number" className="form-control form-control-sm text-center px-1" value={item.localEff} onChange={e => handleFieldChange(idx, 'localEff', e.target.value)} disabled={!isDraft || loading} /></div>
                      
                      {/* ЧЕКБОКС "СРОЧНО" ВНУТРИ УСЛУГИ */}
                      <div className="col-1 px-1 d-flex justify-content-center">
                        <input 
                          type="checkbox" className="form-check-input mt-0 border-secondary" 
                          checked={item.localIsPriority} 
                          onChange={e => handleFieldChange(idx, 'localIsPriority', e.target.checked)} 
                          disabled={!isDraft || loading} title="Приоритетный расчет"
                        />
                      </div>

                      <div className="col-1 text-center d-flex flex-column px-1">
                        {current < 0 ? <span className="text-danger small fw-bold">ERR</span> : <span className="fw-bold text-success">{current.toFixed(2)}</span>}
                      </div>
                      
                      {isDraft && (
                        <div className="col-3 d-flex justify-content-end gap-1">
                          <button className="btn btn-sm btn-primary fw-bold px-2 py-1" onClick={() => handleUpdateItem(idx)} disabled={loading}>💾 Сохранить</button>
                          <button className="btn btn-sm btn-outline-danger px-2 py-1" onClick={() => handleRemoveItem(radiationId)} disabled={loading}>✖ Удалить</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="alert alert-info d-flex justify-content-between align-items-center py-2">
              <h5 className="mb-0">Общий ток:</h5>
              <h4 className="mb-0 fw-bold">{totalCurrentDisplay.toFixed(3)} мА</h4>
            </div>

            {isDraft && (
              <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                <button className="btn btn-success fw-bold px-4" onClick={handleFormCalculation} disabled={loading}>✅ ОТПРАВИТЬ ЗАЯВКУ</button>
                <button className="btn btn-danger fw-bold px-4" onClick={handleDeleteCalculation} disabled={loading}>🗑 УДАЛИТЬ ЗАЯВКУ</button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5 text-muted">Ваша заявка пока пуста.</div>
        )}
      </div>
    </div>
  );
};