import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Diff } from '../../models/Diff';

interface DiffState {
  diffs: Diff[];
  selectedDiff: Diff | null;
}

const initialState: DiffState = {
  diffs: [],
  selectedDiff: null,
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
  },
});

export const { setDiffs, selectDiff, addDiff } = diffSlice.actions;
export default diffSlice.reducer;

