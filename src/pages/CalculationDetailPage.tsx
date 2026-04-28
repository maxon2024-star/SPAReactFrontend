import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { CalculationsApi } from '../api/generated';
import { fetchDraftSummary, formDraft } from '../slices/applicationSlice';
import type { RootState, AppDispatch } from '../store';
import { ROUTES } from '../Routes';

export const CalculationDetailPage: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.applications);
  
  const [calcData, setCalcData] = useState<any>(null);

  const loadCalculation = async () => {
    try {
      const res = await CalculationsApi.getCalculationById(Number(id));
      setCalcData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCalculation();
  }, [id]);

  const handleUpdateItem = async (radiationId: number, current: number) => {
    await CalculationsApi.updateCartItem({ radiation_id: radiationId, current, frequency: 0, work_function: 0 });
    loadCalculation();
  };

  const handleRemoveItem = async (radiationId: number) => {
    await CalculationsApi.removeRadiationFromCart(radiationId);
    dispatch(fetchDraftSummary());
    loadCalculation();
  };

  const handleFormCalculation = async () => {
    await dispatch(formDraft(Number(id)));
    navigate(ROUTES.CALCULATIONS);
  };

  if (!calcData) return <div className="app-container">Загрузка заявки...</div>;

  const isDraft = calcData.status === 'draft';

  return (
    <div className="app-container">
      <BreadCrumbs crumbs={[{ label: 'Все заявки', path: ROUTES.CALCULATIONS }, { label: `Заявка #${id}` }]} />
      
      <div className="bg-white p-4 rounded shadow-sm mt-3">
        <h3>Детали заявки {calcData.status}</h3>
        
        <table className="table mt-4">
          <thead>
            <tr>
              <th>ID Излучения</th>
              <th>Частота</th>
              <th>Работа выхода</th>
              <th>Результат (Ток)</th>
              {isDraft && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {calcData.items?.map((item: any) => (
              <tr key={item.radiation_id}>
                <td>{item.radiation_id}</td>
                <td>{item.frequency}</td>
                <td>{item.work_function}</td>
                <td>{item.current}</td>
                {isDraft && (
                  <td>
                    {/* Кнопка изменения (Update) */}
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleUpdateItem(item.radiation_id, item.current + 10)} disabled={loading}>
                      +10 Ток
                    </button>
                    {/* Кнопка удаления (Delete) */}
                    <button className="btn btn-sm btn-danger" onClick={() => handleRemoveItem(item.radiation_id)} disabled={loading}>
                      Удалить
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {isDraft && (
            <div className="mt-4 text-end">
                {/* Кнопка Формирования */}
                <button className="btn btn-success" onClick={handleFormCalculation} disabled={loading || !calcData.items?.length}>
                    Сформировать заявку
                </button>
            </div>
        )}
      </div>
    </div>
  );
};