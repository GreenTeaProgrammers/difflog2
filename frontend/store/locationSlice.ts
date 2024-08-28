import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Location } from '../../models/Location';

interface LocationState {
  locations: Location[];
  selectedLocation: Location | null;
}

const initialState: LocationState = {
  locations: [],
  selectedLocation: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocations(state, action: PayloadAction<Location[]>) {
      state.locations = action.payload;
    },
    selectLocation(state, action: PayloadAction<Location>) {
      state.selectedLocation = action.payload;
    },
    addLocation(state, action: PayloadAction<Location>) {
      state.locations.push(action.payload);
    },
    removeLocation(state, action: PayloadAction<string>) {
      state.locations = state.locations.filter(
        (location) => location.id !== action.payload
      );
    },
  },
});

export const { setLocations, selectLocation, addLocation, removeLocation } = locationSlice.actions;
export default locationSlice.reducer;

