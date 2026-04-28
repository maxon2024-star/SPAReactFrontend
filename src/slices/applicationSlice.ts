import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CalculationsApi, type M2MInput } from '../api/generated';

export const fetchCalculations = createAsyncThunk(
  'calculations/fetchAll',
  async (filters: { status?: string; date_from?: string; date_to?: string }) => {
    const response = await CalculationsApi.getCalculations(filters);
    return response.data;
  }
);

export const fetchDraftSummary = createAsyncThunk('calculations/draftSummary', async () => {
  const response = await CalculationsApi.getDraftSummary();
  return response.data; 
});

export const fetchCalculationById = createAsyncThunk('calculations/fetchById', async (id: number) => {
  const response = await CalculationsApi.getCalculationById(id);
  return response.data;
});

export const addToDraft = createAsyncThunk('calculations/add', async (input: M2MInput, { dispatch }) => {
  await CalculationsApi.addRadiationToCart(input);
  // После добавления обновляем ID черновика
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
    loading: false,
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
      
      // УМНЫЙ ПАРСИНГ ID ЧЕРНОВИКА
      .addCase(fetchDraftSummary.fulfilled, (state, action) => { 
        const data = action.payload;
        if (typeof data === 'number') {
            state.draftId = data > 0 ? data : null;
        } else if (data && typeof data === 'object') {
            // Ищем ID под любым возможным ключом, который мог отдать Go
            state.draftId = data.id || data.draft_id || data.ID || data.draftId || null;
        } else {
            state.draftId = null;
        }
      })
      
      .addCase(fetchCalculationById.pending, (state) => { state.loading = true; state.currentApp = null; })
      .addCase(fetchCalculationById.fulfilled, (state, action) => { state.loading = false; state.currentApp = action.payload; })
      
      .addCase(addToDraft.pending, (state) => { state.loading = true; })
      .addCase(addToDraft.fulfilled, (state) => { state.loading = false; })
      .addCase(updateDraftItem.pending, (state) => { state.loading = true; })
      .addCase(updateDraftItem.fulfilled, (state) => { state.loading = false; })
      .addCase(removeFromDraft.pending, (state) => { state.loading = true; })
      .addCase(removeFromDraft.fulfilled, (state) => { state.loading = false; })
      .addCase(formDraft.pending, (state) => { state.loading = true; })
      .addCase(formDraft.fulfilled, (state) => { state.loading = false; state.draftId = null; })
      .addCase(resolveCalculation.pending, (state) => { state.loading = true; })
      .addCase(resolveCalculation.fulfilled, (state) => { state.loading = false; })
  },
});

export const { clearDraftAndFilters } = applicationSlice.actions;
export default applicationSlice.reducer;