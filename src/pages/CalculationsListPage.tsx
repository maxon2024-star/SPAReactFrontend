import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCalculations, resolveCalculation } from '../slices/applicationSlice';
import type { RootState, AppDispatch } from '../store';
import { Link } from 'react-router-dom';
import { ROUTES } from '../Routes';
import { BreadCrumbs } from '../components/BreadCrumbs';

export const CalculationsListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading } = useSelector((state: RootState) => state.applications);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const isModerator = user?.role === 2; 

  // Состояния фильтров
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState(''); 
  const [dateTo, setDateTo] = useState(''); // Добавили Date To, так как бэк требует обе даты

  useEffect(() => {
    const loadData = () => {
      // Чтобы захватить весь день 'dateTo', добавляем к нему время 23:59:59 (так как в БД timestamps)
      let finalDateTo = dateTo;
      if (finalDateTo && finalDateTo.length === 10) {
        finalDateTo += " 23:59:59";
      }
      
      dispatch(fetchCalculations({ 
        status: statusFilter, 
        date_from: dateFrom, 
        date_to: finalDateTo 
      }));
    };

    loadData();

    const intervalId = setInterval(loadData, 5000);
    return () => clearInterval(intervalId);
  }, [dispatch, statusFilter, dateFrom, dateTo]);

  const handleResolve = (id: number, action: 'accept' | 'reject') => {
    dispatch(resolveCalculation({ id, action }));
  };

  // Функция для красивых бейджей статусов на основе русских слов из бэкенда
  const getBadgeClass = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'сформирован': return 'warning text-dark';
      case 'завершён': return 'success';
      case 'отклонён': return 'danger';
      case 'draft': return 'secondary';
      default: return 'primary';
    }
  };

  return (
    <div className="app-container">
      <BreadCrumbs crumbs={[{ label: 'Все расчеты' }]} />
      <div className="bg-white p-4 rounded shadow-sm mt-3 border">
        <h3 className="mb-4 text-dark border-bottom pb-2">Журнал расчетов</h3>
        
        {/* Панель фильтров */}
        <div className="row g-3 mb-4 mt-2 bg-light p-3 rounded">
          <div className="col-md-4">
            <label className="form-label text-muted fw-bold">Дата от:</label>
            <input 
              type="date" 
              className="form-control" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)} 
            />
          </div>
          <div className="col-md-4">
            <label className="form-label text-muted fw-bold">Дата до:</label>
            <input 
              type="date" 
              className="form-control" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)} 
            />
          </div>
          <div className="col-md-4">
            <label className="form-label text-muted fw-bold">Статус:</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Все статусы</option>
              {/* Используем точные значения из БД */}
              <option value="сформирован">Сформирована</option>
              <option value="завершён">Завершена</option>
              <option value="отклонён">Отклонена</option>
            </select>
          </div>
          <div className="col-12 text-end mt-2">
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={() => { setDateFrom(''); setDateTo(''); setStatusFilter(''); }}
            >
              Сбросить фильтры
            </button>
          </div>
        </div>

        {loading && list.length === 0 && <p className="text-muted">Загрузка данных...</p>}

        <div className="table-responsive">
          <table className="table table-hover mt-3">
            <thead className="table-light align-middle">
              <tr>
                <th>ID Заявки</th>
                <th>Создатель</th>
                <th>Дата формирования</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {list.map((calc: any) => {
                // Форматируем дату для красоты
                const dateObj = new Date(calc.formed_at || calc.created_at);
                const formattedDate = dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                return (
                  <tr key={calc.id} className="align-middle">
                    <td className="fw-bold">Заявка #{calc.id}</td>
                    <td>{calc.creator_login || 'Неизвестно'}</td>
                    <td>{formattedDate}</td>
                    <td>
                      <span className={`badge bg-${getBadgeClass(calc.status)}`}>
                        {calc.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`${ROUTES.CALCULATIONS}/${calc.id}`} className="btn btn-sm btn-outline-primary me-2">Просмотр</Link>
                      
                      {isModerator && calc.status === 'сформирован' && (
                        <>
                          <button className="btn btn-sm btn-success me-2" onClick={() => handleResolve(calc.id, 'accept')}>Подтвердить</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleResolve(calc.id, 'reject')}>Отклонить</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">Заявки не найдены</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};