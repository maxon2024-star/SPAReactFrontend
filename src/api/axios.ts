import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/', // Проксируется через Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  // Строгая проверка, чтобы не отправить сломанный токен
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});