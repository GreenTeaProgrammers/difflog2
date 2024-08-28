import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from '../features/auth/authSlice';
import locationReducer from '../features/location/locationSlice';
import diffReducer from '../features/diff/diffSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    diff: diffReducer,
  },
});

// TypeScript用の型エクスポート
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();

