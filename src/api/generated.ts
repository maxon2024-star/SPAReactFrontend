import { apiClient } from './axios';

export interface M2MInput {
  frequency: number;
  work_function: number;
  area: number;
  efficiency: number;
  current: number; 
  radiation_id: number;
  is_priority: boolean;
  item_id?: number;
  calc_id?: number;
}

export const RadiationsApi = {
  getAll: (params?: any) => apiClient.get('/api/radiations', { params }),
  getById: (id: number) => apiClient.get(`/api/radiations/${id}`),
};

export const CalculationsApi = {
  getCalculations: (params?: any) => apiClient.get('/api/calculations', { params }),
  getDraftSummary: () => apiClient.get('/api/calculations/draft-summary'),
  getCalculationById: (id: number) => apiClient.get(`/api/calculations/${id}`),
  
  // ИЗМЕНЕНИЕ: Теперь сохраняем только галочку "Приоритет" и ток
  updateCalculation: (id: number, data: { theme?: string; description?: string; total_current?: number }) => 
    apiClient.put(`/api/calculations/${id}`, data),
    
  formCalculation: (id: number) => apiClient.put(`/api/calculations/${id}/form`),
  deleteCalculation: (id: number) => apiClient.delete(`/api/calculations/${id}`),
  completeCalculation: (id: number, action: 'accept' | 'reject') => apiClient.put(`/api/calculations/${id}/complete`, { action }),

  addRadiationToCart: (input: M2MInput) => apiClient.post('/api/calculation-items', input),
  updateCartItem: (input: M2MInput) => apiClient.put('/api/calculation-items', input),
  removeRadiationFromCart: (radiationId: number) => apiClient.delete(`/api/calculation-items?radiation_id=${radiationId}`),
};

export const AuthApi = {
  register: (data: any) => apiClient.post('/api/users/register', data),
  login: (data: any) => apiClient.post('/api/users/login', data),
};