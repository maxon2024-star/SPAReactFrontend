import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CalculationsApi, type M2MInput } from '../api/generated';

// Thunks
export const fetchApplications = createAsyncThunk(
  'applications/fetchAll',
  async (filters: { status?: string; date_from?: string; date_to?: string }) => {
    const response = await CalculationsApi.getCalculations(filters);
    return response.data;
  }
);

export const fetchDraftSummary = createAsyncThunk('applications/draftSummary', async () => {
  const response = await CalculationsApi.getDraftSummary();
  return response.data; // Возвращает { id: number } или пусто
});

export const fetchApplicationById = createAsyncThunk('applications/fetchById', async (id: number) => {
  const response = await CalculationsApi.getCalculationById(id);
  return response.data;
});

export const addToDraft = createAsyncThunk('applications/add', async (input: M2MInput, { dispatch }) => {
  await CalculationsApi.addRadiationToCart(input);
  dispatch(fetchDraftSummary() as any);
});

export const updateDraftItem = createAsyncThunk('applications/updateItem', async (data: { appId: number, input: M2MInput }, { dispatch }) => {
  await CalculationsApi.updateCartItem(data.input);
  dispatch(fetchApplicationById(data.appId) as any);
});

export const removeFromDraft = createAsyncThunk('applications/removeItem', async (data: { appId: number, radiationId: number }, { dispatch }) => {
  await CalculationsApi.removeRadiationFromCart(data.radiationId);
  dispatch(fetchApplicationById(data.appId) as any);
  dispatch(fetchDraftSummary() as any);
});

export const formDraft = createAsyncThunk('applications/form', async (id: number, { dispatch }) => {
  await CalculationsApi.formCalculation(id);
  dispatch(fetchDraftSummary() as any);
  dispatch(fetchApplicationById(id) as any);
});

const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    list: [] as any[],
    currentApp: null as any,
    draftId: null as number | null,
    loading: false, // Флаг для блокировки интерфейса (Thunk Middleware)
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
      // Fetch All
      .addCase(fetchApplications.fulfilled, (state, action) => { state.list = action.payload || []; })
      
      // Draft Summary
      .addCase(fetchDraftSummary.fulfilled, (state, action) => { state.draftId = action.payload?.id || null; })
      
      // Fetch By ID
      .addCase(fetchApplicationById.pending, (state) => { state.loading = true; state.currentApp = null; })
      .addCase(fetchApplicationById.fulfilled, (state, action) => { state.loading = false; state.currentApp = action.payload; })
      .addCase(fetchApplicationById.rejected, (state) => { state.loading = false; })
      
      // Блокировка интерфейса во время изменения данных М-М и заявки
      .addCase(addToDraft.pending, (state) => { state.loading = true; })
      .addCase(addToDraft.fulfilled, (state) => { state.loading = false; })
      .addCase(addToDraft.rejected, (state) => { state.loading = false; })
      
      .addCase(updateDraftItem.pending, (state) => { state.loading = true; })
      .addCase(updateDraftItem.fulfilled, (state) => { state.loading = false; })
      .addCase(updateDraftItem.rejected, (state) => { state.loading = false; })

      .addCase(removeFromDraft.pending, (state) => { state.loading = true; })
      .addCase(removeFromDraft.fulfilled, (state) => { state.loading = false; })
      .addCase(removeFromDraft.rejected, (state) => { state.loading = false; })

      .addCase(formDraft.pending, (state) => { state.loading = true; })
      .addCase(formDraft.fulfilled, (state) => { state.loading = false; state.draftId = null; })
      .addCase(formDraft.rejected, (state) => { state.loading = false; });
  },
});

export const { clearDraftAndFilters } = applicationSlice.actions;
export default applicationSlice.reducer;