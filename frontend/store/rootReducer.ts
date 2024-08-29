import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import locationReducer from './locationSlice';
import diffReducer from './diffSlice';
import captureReducer from './captureSlice';

// すべてのスライスを1つのrootReducerに結合
const rootReducer = combineReducers({
  auth: authReducer,
  location: locationReducer,
  diff: diffReducer,
  capture: captureReducer,
});

export default rootReducer;
export type AppDispatch = typeof store.dispatch;