import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../slices/authSlice';
import { apiClient } from '../api/axios';
import { ROUTES } from '../Routes';

interface AuthProps {
  type: 'login' | 'register';
}

export const AuthPage: React.FC<AuthProps> = ({ type }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, setLoginStr] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = type === 'register' 
        ? { login, password, role: 1 } 
        : { login, password };

      const endpoint = type === 'login' ? '/api/users/login' : '/api/users/register';
      
      let res = await apiClient.post(endpoint, payload);

      if (type === 'register') {
        res = await apiClient.post('/api/users/login', { login, password });
      }

      const token = res.data.access_token || res.data.token;
      
      if (!token) {
        setError('Не удалось получить токен доступа от сервера.');
        return;
      }

      // ИЩЕМ РОЛЬ МОДЕРАТОРА: Пытаемся вытащить её из тела JWT токена
      let actualRole = type === 'register' ? 1 : (res.data.role || 1);
      try {
        const base64Url = token.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const parsedToken = JSON.parse(jsonPayload);
          
          if (parsedToken.role) actualRole = parsedToken.role;
          if (parsedToken.Role) actualRole = parsedToken.Role;
        }
      } catch (e) {
        console.error("Ошибка при чтении роли из токена:", e);
      }

      // Сохраняем пользователя с корректной ролью
      const user = res.data.user || { 
        id: res.data.id || Date.now(), 
        login: login, 
        role: actualRole 
      };
      
      dispatch(setAuth({ user, token }));
      navigate(ROUTES.RADIATIONS);

    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 500) {
        setError('Пользователь с таким логином уже существует.');
      } else if (err.response && err.response.status === 401) {
        setError('Неверный логин или пароль.');
      } else {
        setError('Произошла ошибка при обращении к серверу.');
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <form 
        className="p-5 bg-white rounded shadow" 
        style={{ width: '100%', maxWidth: '420px', borderTop: '5px solid #0d6efd' }} 
        onSubmit={handleSubmit}
      >
        <h2 className="text-center mb-4 fw-bold text-dark">
          {type === 'login' ? 'С возвращением!' : 'Создать аккаунт'}
        </h2>
        
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="mb-3">
          <label className="form-label text-muted fw-semibold">Логин</label>
          <input 
            className="form-control form-control-lg bg-light" 
            value={login} 
            onChange={e => setLoginStr(e.target.value)} 
            placeholder="Введите логин"
            required 
          />
        </div>
        
        <div className="mb-4">
          <label className="form-label text-muted fw-semibold">Пароль</label>
          <input 
            className="form-control form-control-lg bg-light" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••"
            required 
          />
        </div>
        
        <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold mb-3">
          {type === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>

        <div className="text-center text-muted">
          {type === 'login' ? (
            <>Нет аккаунта? <Link to={ROUTES.REGISTER} className="text-decoration-none">Создать</Link></>
          ) : (
            <>Уже есть аккаунт? <Link to={ROUTES.LOGIN} className="text-decoration-none">Войти</Link></>
          )}
        </div>
      </form>
    </div>
  );
};