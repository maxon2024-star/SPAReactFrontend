import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await apiClient.post(endpoint, { login, password });
      
      dispatch(setAuth({ user: res.data.user, token: res.data.token }));
      navigate(ROUTES.RADIATIONS);
    } catch (err) {
      alert('Ошибка авторизации/регистрации');
    }
  };

  return (
    <div className="app-container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <form className="auth-form p-4 bg-white rounded shadow" style={{ width: '100%', maxWidth: '400px' }} onSubmit={handleSubmit}>
        <h2 className="text-center mb-4 text-primary">{type === 'login' ? 'Вход' : 'Регистрация'}</h2>
        <div className="mb-3">
          <label>Логин</label>
          <input className="form-control" value={login} onChange={e => setLoginStr(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label>Пароль</label>
          <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          {type === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};