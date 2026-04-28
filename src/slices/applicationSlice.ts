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
  return response.data;
});

export const addToDraft = createAsyncThunk('applications/add', async (input: M2MInput, { dispatch }) => {
  await CalculationsApi.addRadiationToCart(input);
  dispatch(fetchDraftSummary());
});

export const formDraft = createAsyncThunk('applications/form', async (id: number, { dispatch }) => {
  await CalculationsApi.formCalculation(id);
  dispatch(fetchDraftSummary());
});

const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    list: [] as any[],
    draftId: null as number | null,
    loading: false,
  },
  reducers: {
    clearDraftAndFilters: (state) => {
      state.draftId = null;
      state.list = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => { state.loading = true; })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchDraftSummary.fulfilled, (state, action) => {
        state.draftId = action.payload?.id || null;
      })
      // Блокировка UI (анимация загрузки)
      .addCase(addToDraft.pending, (state) => { state.loading = true; })
      .addCase(addToDraft.fulfilled, (state) => { state.loading = false; })
      .addCase(formDraft.pending, (state) => { state.loading = true; })
      .addCase(formDraft.fulfilled, (state) => { state.loading = false; state.draftId = null; });
  },
});

export const { clearDraftAndFilters } = applicationSlice.actions;
export default applicationSlice.reducer;