import { apiClient } from './axios';

export interface M2MInput {
  frequency: number;
  work_function: number;
  current: number; // Ток - результат в заявке
  radiation_id: number;
}

export const CalculationsApi = {
  // Корзина (М-М таблица) - используем эндпоинты /api/calculation-items
  addRadiationToCart: (input: M2MInput) => apiClient.post('/api/calculation-items', input),
  updateCartItem: (input: M2MInput) => apiClient.put('/api/calculation-items', input),
  // Axios delete не передает тело напрямую так же просто, поэтому передаем radiation_id как query-параметр или через data
  removeRadiationFromCart: (radiationId: number) => apiClient.delete(`/api/calculation-items?radiation_id=${radiationId}`),
  
  // Заявки - используем эндпоинты /api/calculations
  getCalculations: (params?: { status?: string; date_from?: string; date_to?: string }) => 
    apiClient.get('/api/calculations', { params }),
    
  getDraftSummary: () => apiClient.get('/api/calculations/draft-summary'),
  
  getCalculationById: (id: number) => apiClient.get(`/api/calculations/${id}`),
  
  formCalculation: (id: number) => apiClient.put(`/api/calculations/${id}/form`),
  
  completeCalculation: (id: number, action: 'accept' | 'reject') => 
    apiClient.put(`/api/calculations/${id}/complete`, { action }),
};

export const AuthApi = {
  register: (data: any) => apiClient.post('/api/users/register', data),
  login: (data: any) => apiClient.post('/api/users/login', data),
};