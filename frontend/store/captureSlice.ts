import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../services/api';
import { DiffResponse, Capture } from '../types/diff'; // DiffResponseをインポート

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
export const addCapture = createAsyncThunk('capture/addCapture', async (capture: Omit<Capture, 'id'>) => {
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
    setDiffResponse(state, action: PayloadAction<{ id: string; diffResponse: DiffResponse }>) {
      const { id, diffResponse } = action.payload;
      const capture = state.captures.find(capture => capture.id === id);
      if (capture) {
        capture.diffResponse = diffResponse;
        capture.analyzed = true;
      }
    },
    // updateDiffResponse アクションを追加
    updateDiffResponse(state, action: PayloadAction<{ added: number; deleted: number; modified: number }>) {
      if (state.selectedCapture) {
        state.selectedCapture.diffResponse = {
          ...state.selectedCapture.diffResponse,
          added: action.payload.added,
          deleted: action.payload.deleted,
          modified: action.payload.modified,
        };
      }
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

export const { selectCapture, setDiffResponse, updateDiffResponse } = captureSlice.actions;
export default captureSlice.reducer;