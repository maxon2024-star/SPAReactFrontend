import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../api/generated';

export const RegisterPage: React.FC = () => {
  const [login, setLoginStr] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(1);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AuthApi.register({ login, password, role });
      alert('Успешно! Теперь войдите.');
      navigate('/login');
    } catch (err) {
      alert('Ошибка регистрации');
    }
  };

  return (
    <div className="app-container">
      <div className="auth-container">
        <h2 className="mb-4 text-center">Регистрация</h2>
        <form onSubmit={handleRegister} className="auth-form">
          <input className="form-control" placeholder="Логин" value={login} onChange={e => setLoginStr(e.target.value)} required />
          <input className="form-control" type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
          <select className="form-control" value={role} onChange={e => setRole(Number(e.target.value))}>
            <option value={1}>Физик</option>
            <option value={2}>Профессор (Модератор)</option>
          </select>
          <button type="submit" className="btn btn-success w-100">Зарегистрироваться</button>
        </form>
      </div>
    </div>
  );
};