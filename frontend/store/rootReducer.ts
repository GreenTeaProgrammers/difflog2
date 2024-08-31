import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import locationReducer from './locationSlice';
import diffReducer from './diffSlice';
import captureReducer from './captureSlice';
import userSettingReducer from './userSettingSlice';

// すべてのスライスを1つのrootReducerに結合
const rootReducer = combineReducers({
  auth: authReducer,
  location: locationReducer,
  diff: diffReducer,
  capture: captureReducer,
  userSetting: userSettingReducer,

});

export default rootReducer;
