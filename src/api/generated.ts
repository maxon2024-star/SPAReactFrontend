import { apiClient } from './axios';

// Сгенерированные типы
export interface M2MInput {
  area?: number;
  efficiency?: number;
  frequency?: number;
  radiation_id: number;
  work_function?: number;
}

export const CalculationsApi = {
  // Корзина (М-М)
  addRadiationToCart: (input: M2MInput) => apiClient.post('/api/calculation-items', input),
  updateCartItem: (input: M2MInput) => apiClient.put('/api/calculation-items', input),
  removeRadiationFromCart: (radiationId: number) => apiClient.delete(`/api/calculation-items?radiation_id=${radiationId}`),
  
  // Заявки
  getCalculations: (params?: { status?: string; date_from?: string; date_to?: string }) => 
    apiClient.get('/api/calculations', { params }),
  getDraftSummary: () => apiClient.get('/api/calculations/draft-summary'),
  getCalculationById: (id: number) => apiClient.get(`/api/calculations/${id}`),
  formCalculation: (id: number) => apiClient.put(`/api/calculations/${id}/form`),
  completeCalculation: (id: number, action: 'accept' | 'reject') => 
    apiClient.put(`/api/calculations/${id}/complete`, { action }),
};