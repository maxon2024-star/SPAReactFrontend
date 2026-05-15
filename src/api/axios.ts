import axios from 'axios';

const isTauri = '__TAURI__' in window;
const FIXED_IP = '10.254.43.49:8000';

const BASE_URL = isTauri 
  ? `http://${FIXED_IP}` 
  : (window.location.protocol === 'https:' ? '' : `http://${FIXED_IP}`);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
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