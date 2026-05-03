import axios from 'axios';

// Проверяем, запущен ли код внутри десктопного приложения Tauri
const isTauri = '__TAURI__' in window;

// Если это Tauri - бьем строго по IP. Если браузер с HTTPS - используем прокси ''.
const BASE_URL = isTauri 
  ? 'http://10.254.43.49:8000' 
  : (window.location.protocol === 'https:' ? '' : 'http://10.254.43.49:8000');

export const apiClient = axios.create({
  baseURL: BASE_URL,
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