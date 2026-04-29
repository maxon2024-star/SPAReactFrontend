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
  
  // Проверка роли: 2 - Модератор, 1 - обычный Физик
  const isModerator = user?.role === 2; 

  // 1. Состояния инпутов
  const [dateFrom, setDateFrom] = useState(''); 
  const [dateTo, setDateTo] = useState(''); 
  const [statusFilter, setStatusFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');

  // 2. Состояния ПРИМЕНЕННЫХ фильтров
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('');
  const [appliedCreator, setAppliedCreator] = useState('');

  useEffect(() => {
    const loadData = () => {
      let finalDateTo = appliedDateTo;
      if (finalDateTo && finalDateTo.length === 10) {
        finalDateTo += " 23:59:59";
      }
      
      dispatch(fetchCalculations({ 
        status: appliedStatus, 
        date_from: appliedDateFrom, 
        date_to: finalDateTo 
      }));
    };

    loadData();
    const intervalId = setInterval(loadData, 5000);
    return () => clearInterval(intervalId);
  }, [dispatch, appliedStatus, appliedDateFrom, appliedDateTo]);

  const handleResolve = (id: number, action: 'accept' | 'reject') => {
    dispatch(resolveCalculation({ id, action }));
  };

  const getBadgeClass = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'сформирован': return 'warning text-dark';
      case 'завершён': return 'success';
      case 'отклонён': return 'danger';
      case 'draft': return 'secondary';
      default: return 'primary';
    }
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

  // 3. Локальный фильтр (только для модератора)
  const displayedList = list.filter((calc: any) => {
    if (!isModerator || !appliedCreator) return true; 
    const login = (calc.creator_login || calc.CreatorLogin || '').toLowerCase();
    return login.includes(appliedCreator.toLowerCase());
  });

  // Динамическая ширина колонок для фильтров
  const colClass = isModerator ? "col-md-3" : "col-md-4";

  return (
    <div className="app-container">
      <BreadCrumbs crumbs={[{ label: 'Все расчеты' }]} />
      <div className="bg-white p-4 rounded shadow-sm mt-3 border">
        <h3 className="mb-4 text-dark border-bottom pb-2">
          {isModerator ? 'Журнал заявок (Панель Модератора)' : 'Мои заявки'}
        </h3>
        
        {/* Панель фильтров */}
        <div className="row g-3 mb-4 mt-2 bg-light p-3 rounded">
          <div className={colClass}>
            <label className="form-label text-muted fw-bold">Дата от:</label>
            <input 
              type="date" 
              className="form-control" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)} 
            />
          </div>
          <div className={colClass}>
            <label className="form-label text-muted fw-bold">Дата до:</label>
            <input 
              type="date" 
              className="form-control" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)} 
            />
          </div>
          <div className={colClass}>
            <label className="form-label text-muted fw-bold">Статус:</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Все статусы</option>
              <option value="сформирован">Сформирована</option>
              <option value="завершён">Завершена</option>
              <option value="отклонён">Отклонена</option>
            </select>
          </div>
          
          {/* Поле поиска по создателю видно ТОЛЬКО модератору */}
          {isModerator && (
            <div className={colClass}>
              <label className="form-label text-muted fw-bold">Создатель:</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Логин..."
                value={creatorFilter} 
                onChange={(e) => setCreatorFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()} 
              />
            </div>
          )}
          
          <div className="col-12 d-flex justify-content-end gap-2 mt-3 border-top pt-3">
            <button className="btn btn-outline-secondary" onClick={handleResetFilters}>
              Сбросить
            </button>
            <button className="btn btn-primary px-4 fw-bold" onClick={handleSearchClick}>
              🔍 Поиск
            </button>
          </div>
        </div>

        {loading && list.length === 0 && <p className="text-muted text-center py-3">Загрузка данных...</p>}

        <div className="table-responsive">
          <table className="table table-hover mt-3">
            <thead className="table-light align-middle">
              <tr>
                <th>ID Заявки</th>
                {/* Колонка "Создатель" видна ТОЛЬКО модератору */}
                {isModerator && <th>Создатель</th>}
                <th>Дата формирования</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {displayedList.map((calc: any) => {
                const dateObj = new Date(calc.formed_at || calc.created_at);
                const formattedDate = dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                return (
                  <tr key={calc.id} className="align-middle">
                    <td className="fw-bold">Заявка #{calc.id}</td>
                    
                    {/* Ячейка с логином видна ТОЛЬКО модератору */}
                    {isModerator && (
                      <td>{calc.creator_login || calc.CreatorLogin || 'Неизвестно'}</td>
                    )}
                    
                    <td>{formattedDate}</td>
                    <td>
                      <span className={`badge bg-${getBadgeClass(calc.status)}`}>
                        {calc.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`${ROUTES.CALCULATIONS}/${calc.id}`} className="btn btn-sm btn-outline-primary me-2">Просмотр</Link>
                      
                      {/* Кнопки Подтвердить/Отклонить видны ТОЛЬКО модератору и только для статуса "сформирован" */}
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
              {displayedList.length === 0 && !loading && (
                <tr>
                  {/* Меняем colSpan в зависимости от роли (5 для админа, 4 для юзера) */}
                  <td colSpan={isModerator ? 5 : 4} className="text-center py-5 text-muted">Заявки не найдены</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};