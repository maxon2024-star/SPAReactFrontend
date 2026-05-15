import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CalculationsApi, type M2MInput } from '../api/generated';

export const fetchCalculations = createAsyncThunk('calculations/fetchAll', async (filters: any) => {
  const response = await CalculationsApi.getCalculations(filters);
  return response.data;
});

export const fetchDraftSummary = createAsyncThunk('calculations/draftSummary', async () => {
  const response = await CalculationsApi.getDraftSummary();
  return response.data; 
});

export const fetchCalculationById = createAsyncThunk('calculations/fetchById', async (id: number) => {
  const response = await CalculationsApi.getCalculationById(id);
  return response.data;
});

export const updateCalculationFields = createAsyncThunk(
  'calculations/updateFields', 
  async (data: { id: number, theme?: string, description?: string, total_current?: number }, { dispatch }) => {
    await CalculationsApi.updateCalculation(data.id, data);
    dispatch(fetchCalculationById(data.id) as any);
  }
);

export const deleteCalculation = createAsyncThunk('calculations/delete', async (id: number, { dispatch }) => {
  await CalculationsApi.deleteCalculation(id);
  dispatch(fetchDraftSummary() as any);
});

export const addToDraft = createAsyncThunk('calculations/add', async (input: M2MInput, { dispatch }) => {
  await CalculationsApi.addRadiationToCart(input);
  dispatch(fetchDraftSummary() as any);
});

export const updateDraftItem = createAsyncThunk('calculations/updateItem', async (data: { appId: number, input: M2MInput }, { dispatch }) => {
  await CalculationsApi.updateCartItem(data.input);
  dispatch(fetchCalculationById(data.appId) as any);
});

export const removeFromDraft = createAsyncThunk('calculations/removeItem', async (data: { appId: number, radiationId: number }, { dispatch }) => {
  await CalculationsApi.removeRadiationFromCart(data.radiationId);
  dispatch(fetchCalculationById(data.appId) as any);
  dispatch(fetchDraftSummary() as any);
});

export const formDraft = createAsyncThunk('calculations/form', async (id: number, { dispatch }) => {
  await CalculationsApi.formCalculation(id);
  dispatch(fetchDraftSummary() as any);
  dispatch(fetchCalculationById(id) as any);
});

export const resolveCalculation = createAsyncThunk('calculations/resolve', async (data: { id: number, action: 'accept' | 'reject' }, { dispatch }) => {
  await CalculationsApi.completeCalculation(data.id, data.action);
  dispatch(fetchCalculations({}) as any); 
});

const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    list: [] as any[],
    currentApp: null as any,
    draftId: null as number | null,
    loading: false, // Глобальный лоадер для блокировки кнопок!
  },
  reducers: {
    clearDraftAndFilters: (state) => {
      state.draftId = null;
      state.list = [];
      state.currentApp = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalculations.fulfilled, (state, action) => { state.list = action.payload || []; })
      .addCase(fetchDraftSummary.fulfilled, (state, action) => { 
        const data = action.payload;
        state.draftId = (typeof data === 'number') ? (data > 0 ? data : null) : (data?.id || data?.draft_id || data?.ID || null);
      })
      .addCase(fetchCalculationById.pending, (state) => { state.loading = true; state.currentApp = null; })
      .addCase(fetchCalculationById.fulfilled, (state, action) => { state.loading = false; state.currentApp = action.payload; })
      
      // Блокируем кнопки во время любых изменений (анимация загрузки по ТЗ)
      .addMatcher((action) => action.type.endsWith('/pending') && action.type.startsWith('calculations/'), (state) => { state.loading = true; })
      .addMatcher((action) => action.type.endsWith('/fulfilled') && action.type.startsWith('calculations/'), (state) => { state.loading = false; })
      .addMatcher((action) => action.type.endsWith('/rejected') && action.type.startsWith('calculations/'), (state) => { state.loading = false; });
  },
});

export const { clearDraftAndFilters } = applicationSlice.actions;
export default applicationSlice.reducer;