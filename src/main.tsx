import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'; // Импортируем Provider
import App from './App.tsx';
import { store } from './store'; // Импортируем наш store
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* Оборачиваем приложение, давая всем компонентам доступ к Redux */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);