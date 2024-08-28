import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from './authSlice';
import locationReducer from './locationSlice';
import diffReducer from './diffSlice';
import captureReducer from './captureSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    diff: diffReducer,
    capture: captureReducer,
  },
});

// TypeScript用の型エクスポート
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();

