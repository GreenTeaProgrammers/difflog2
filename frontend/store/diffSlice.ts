import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Diff } from '../types/diff';
import { DiffResponse } from '../types/diff'; // DiffResponseの型をインポート

interface DiffState {
  diffs: Diff[];
  selectedDiff: Diff | null;
  diffResponse: DiffResponse | null; // 追加
}

const initialState: DiffState = {
  diffs: [],
  selectedDiff: null,
  diffResponse: null, // 初期値をnullに設定
};

const diffSlice = createSlice({
  name: 'diff',
  initialState,
  reducers: {
    setDiffs(state, action: PayloadAction<Diff[]>) {
      state.diffs = action.payload;
    },
    selectDiff(state, action: PayloadAction<Diff>) {
      state.selectedDiff = action.payload;
    },
    addDiff(state, action: PayloadAction<Diff>) {
      state.diffs.push(action.payload);
    },
    setDiffResponse(state, action: PayloadAction<DiffResponse>) {
      state.diffResponse = action.payload; // DiffResponseを設定
    },
    updateDiffResponse(state, action: PayloadAction<DiffResponse>) {
      if (state.diffResponse) {
        state.diffResponse = { ...state.diffResponse, ...action.payload };
      }
    },
  },
});

export const { setDiffs, selectDiff, addDiff, setDiffResponse , updateDiffResponse} = diffSlice.actions;
export default diffSlice.reducer;
