import { createSlice } from "@reduxjs/toolkit";

// stateの型を定義
interface UserSettingState {
  isDarkMode: boolean;
}
// 初期状態を定義
const initialState: UserSettingState = {
  isDarkMode: true,
};
// createSliceを使ってスライスを作成
const userSettingSlice = createSlice({
  name: "userSetting",
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.isDarkMode = !state.isDarkMode;
    },
  },
});

export const { toggleDarkMode } = userSettingSlice.actions;
export default userSettingSlice.reducer;