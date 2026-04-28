import { apiClient } from './axios';

export interface M2MInput {
  frequency: number;
  work_function: number;
  current: number; // Ток - результат в заявке
  radiation_id: number;
}

export const CalculationsApi = {
  // Корзина (М-М)
  addRadiationToCart: (input: M2MInput) => apiClient.post('/api/radiation_calculation/items', input),
  updateCartItem: (input: M2MInput) => apiClient.put('/api/radiation_calculation/items', input),
  removeRadiationFromCart: (radiationId: number) => apiClient.delete(`/api/radiation_calculation/items?radiation_id=${radiationId}`),
  
  // Заявки
  getCalculations: (params?: { status?: string; date_from?: string; date_to?: string }) => 
    apiClient.get('/api/radiation_calculation', { params }),
  getDraftSummary: () => apiClient.get('/api/radiation_calculation/draft-summary'),
  getCalculationById: (id: number) => apiClient.get(`/api/radiation_calculation/${id}`),
  formCalculation: (id: number) => apiClient.put(`/api/radiation_calculation/${id}/form`),
  completeCalculation: (id: number, action: 'accept' | 'reject') => 
    apiClient.put(`/api/radiation_calculation/${id}/complete`, { action }),
};