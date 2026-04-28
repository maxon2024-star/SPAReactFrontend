import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplications } from '../store/slices/applicationSlice';
import { CalculationsApi } from '../api/generated';
import { Link } from 'react-router-dom';

export const ApplicationsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state: any) => state.applications);
  const { user } = useSelector((state: any) => state.auth);
  
  // Backend filters
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Frontend filter
  const [creatorFilter, setCreatorFilter] = useState('');

  const isModerator = user?.role === 2;

  // Short Polling
  useEffect(() => {
    const loadApps = () => {
      dispatch(fetchApplications({ status, date_from: dateFrom, date_to: dateTo }) as any);
    };
    loadApps();
    const intervalId = setInterval(loadApps, 5000); // Раз в 5 секунд
    return () => clearInterval(intervalId);
  }, [dispatch, status, dateFrom, dateTo]);

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    try {
      await CalculationsApi.completeCalculation(id, action);
      dispatch(fetchApplications({ status, date_from: dateFrom, date_to: dateTo }) as any);
    } catch (e) {
      alert('Ошибка при изменении статуса');
    }
  };

  const filteredList = list.filter((app: any) => 
    isModerator && creatorFilter 
      ? app.physicist?.login.toLowerCase().includes(creatorFilter.toLowerCase())
      : true
  );

  return (
    <div className="app-container">
      <h2>{isModerator ? 'Все заявки (Панель модератора)' : 'Мои заявки'}</h2>
      
      <div className="filters d-flex gap-3 mb-4 mt-3">
        <select className="form-select w-auto" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Все статусы</option>
          <option value="draft">Черновик</option>
          <option value="formed">Сформирован</option>
          <option value="completed">Завершен</option>
        </select>
        <input type="date" className="form-control w-auto" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <input type="date" className="form-control w-auto" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        
        {isModerator && (
          <input 
            type="text" 
            className="form-control w-auto" 
            placeholder="Фильтр по создателю..." 
            value={creatorFilter} 
            onChange={e => setCreatorFilter(e.target.value)} 
          />
        )}
      </div>

      {loading && list.length === 0 && <div>Загрузка...</div>}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Статус</th>
            <th>Дата</th>
            {isModerator && <th>Создатель</th>}
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.map((app: any) => (
            <tr key={app.id}>
              <td>{app.id}</td>
              <td>{app.status}</td>
              <td>{app.formed_at || app.created_at}</td>
              {isModerator && <td>{app.physicist?.login}</td>}
              <td>
                <Link to={`/applications/${app.id}`} className="btn btn-sm btn-info me-2">Просмотр</Link>
                {isModerator && app.status === 'formed' && (
                  <>
                    <button className="btn btn-sm btn-success me-2" onClick={() => handleAction(app.id, 'accept')}>Подтвердить</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleAction(app.id, 'reject')}>Отклонить</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};