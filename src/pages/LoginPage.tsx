import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAuth } from '../slices/authSlice';
import { AuthApi } from '../api/generated';
import { fetchDraftSummary } from '../slices/applicationSlice';

export const LoginPage: React.FC = () => {
  const [login, setLoginStr] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Только axios (из сгенерированного API)
      const res = await AuthApi.login({ login, password });
      dispatch(setAuth({ user: res.data.user, token: res.data.token }));
      dispatch(fetchDraftSummary() as any); // Подтягиваем инфу о черновике
      navigate('/radiations');
    } catch (err) {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="app-container">
      <div className="auth-container">
        <h2 className="mb-4 text-center">Вход</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin} className="auth-form">
          <input className="form-control" placeholder="Логин" value={login} onChange={e => setLoginStr(e.target.value)} required />
          <input className="form-control" type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn btn-primary w-100">Войти</button>
        </form>
      </div>
    </div>
  );
};