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

  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [statusFilter, setStatusFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');

  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('');
  const [appliedCreator, setAppliedCreator] = useState('');

  useEffect(() => {
    const loadData = () => {
      let finalDateTo = appliedDateTo;
      if (finalDateTo && finalDateTo.length === 10) finalDateTo += " 23:59:59";
      
      dispatch(fetchCalculations({ status: appliedStatus, date_from: appliedDateFrom, date_to: finalDateTo }));
    };

    loadData();
    const intervalId = setInterval(loadData, 5000); // Short Polling
    return () => clearInterval(intervalId);
  }, [dispatch, appliedStatus, appliedDateFrom, appliedDateTo]);

  const handleResolve = (id: number, action: 'accept' | 'reject') => {
    dispatch(resolveCalculation({ id, action }));
  };

  const handleSearchClick = () => {
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setAppliedStatus(statusFilter);
    if (isModerator) setAppliedCreator(creatorFilter);
  };

  const handleResetFilters = () => {
    setDateFrom(''); setDateTo(''); setStatusFilter(''); setCreatorFilter('');
    setAppliedDateFrom(''); setAppliedDateTo(''); setAppliedStatus(''); setAppliedCreator('');
  };

  const displayedList = list.filter((calc: any) => {
    if (!isModerator || !appliedCreator) return true; 
    const login = (calc.creator_login || calc.CreatorLogin || '').toLowerCase();
    return login.includes(appliedCreator.toLowerCase());
  });

  const colClass = isModerator ? "col-md-3" : "col-md-4";

  return (
    <div className="app-container position-relative">
      {loading && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      <BreadCrumbs crumbs={[{ label: 'Все расчеты' }]} />
      <div className="bg-white p-4 rounded shadow-sm mt-3 border">
        <h3 className="mb-4 text-dark border-bottom pb-2">
          {isModerator ? 'Журнал заявок (Панель Модератора)' : 'Мои заявки'}
        </h3>
        
        <div className="row g-3 mb-4 mt-2 bg-light p-3 rounded">
          <div className={colClass}>
            <label className="form-label text-muted fw-bold">Дата от:</label>
            <input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} disabled={loading} />
          </div>
          <div className={colClass}>
            <label className="form-label text-muted fw-bold">Дата до:</label>
            <input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} disabled={loading} />
          </div>
          <div className={colClass}>
            <label className="form-label text-muted fw-bold">Статус:</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} disabled={loading}>
              <option value="">Все статусы</option>
              <option value="сформирован">Сформирована</option>
              <option value="завершён">Завершена</option>
              <option value="отклонён">Отклонена</option>
            </select>
          </div>
          
          {isModerator && (
            <div className={colClass}>
              <label className="form-label text-muted fw-bold">Создатель:</label>
              <input type="text" className="form-control" placeholder="Логин..." value={creatorFilter} onChange={(e) => setCreatorFilter(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()} disabled={loading} />
            </div>
          )}
          
          <div className="col-12 d-flex justify-content-end gap-2 mt-3 border-top pt-3">
            <button className="btn btn-outline-secondary" onClick={handleResetFilters} disabled={loading}>Сбросить</button>
            <button className="btn btn-primary px-4 fw-bold" onClick={handleSearchClick} disabled={loading}>🔍 Поиск</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover mt-3">
            <thead className="table-light align-middle">
              <tr>
                <th>Тема заявки</th>
                {isModerator && <th>Создатель</th>}
                <th>Дата формирования</th>
                <th>Статус</th>
                <th>Результат (мА)</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {displayedList.map((calc: any) => {
                const dateObj = new Date(calc.formed_at || calc.created_at);
                const formattedDate = dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
                
                // СТРОГАЯ ПРОВЕРКА ТЕМЫ (если пусто или пробелы -> выводим ID)
                const themeVal = calc.theme || calc.Theme || '';
                const themeDisplay = themeVal.trim() !== '' ? themeVal : `Заявка #${calc.id}`;

                return (
                  <tr key={calc.id} className="align-middle">
                    <td>
                      <Link to={`${ROUTES.CALCULATIONS}/${calc.id}`} className="fw-bold text-decoration-none text-primary fs-6 d-flex align-items-center">
                        {themeDisplay}
                        {/* ИНДИКАТОР ПРИОРИТЕТА */}
                        {(calc.is_priority || calc.IsPriority) && (
                          <span className="ms-2 badge bg-danger" style={{ fontSize: '10px' }}>СРОЧНО</span>
                        )}
                      </Link>
                    </td>
                    
                    {isModerator && <td>{calc.creator_login || calc.CreatorLogin || 'Неизвестно'}</td>}
                    <td>{formattedDate}</td>
                    <td><span className={`badge bg-primary`}>{calc.status}</span></td>
                    <td className="fw-bold text-success">{calc.total_current ? calc.total_current.toFixed(3) : '—'}</td>

                    <td>
                      <Link to={`${ROUTES.CALCULATIONS}/${calc.id}`} className="btn btn-sm btn-outline-primary me-2">Просмотр</Link>
                      {isModerator && calc.status === 'сформирован' && (
                        <>
                          <button className="btn btn-sm btn-success me-2" onClick={() => handleResolve(calc.id, 'accept')} disabled={loading}>Подтвердить</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleResolve(calc.id, 'reject')} disabled={loading}>Отклонить</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {displayedList.length === 0 && !loading && (
                <tr><td colSpan={isModerator ? 6 : 5} className="text-center py-5 text-muted">Заявки не найдены</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};