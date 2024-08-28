import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Capture } from '../types/capture'; // Update the file path to the correct location
import api from '../services/api';

interface CaptureState {
  captures: Capture[];
  selectedCapture: Capture | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CaptureState = {
  captures: [],
  selectedCapture: null,
  status: 'idle',
  error: null,
};

// 撮影データの取得
export const fetchCaptures = createAsyncThunk('capture/fetchCaptures', async (locationId: string) => {
  const response = await api.get(`/locations/${locationId}/captures`);
  return response.data as Capture[];
});

// 新しい撮影データの追加
export const addCapture = createAsyncThunk('capture/addCapture', async (capture: Capture) => {
  const response = await api.post('/captures', capture);
  return response.data as Capture;
});

const captureSlice = createSlice({
  name: 'capture',
  initialState,
  reducers: {
    selectCapture(state, action: PayloadAction<Capture>) {
      state.selectedCapture = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCaptures.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCaptures.fulfilled, (state, action: PayloadAction<Capture[]>) => {
        state.status = 'succeeded';
        state.captures = action.payload;
      })
      .addCase(fetchCaptures.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch captures';
      })
      .addCase(addCapture.fulfilled, (state, action: PayloadAction<Capture>) => {
        state.captures.push(action.payload);
      });
  },
});

export const { selectCapture } = captureSlice.actions;
export default captureSlice.reducer;
