import api from './api';
import { Location } from '../types/location';

export const fetchLocations = async (): Promise<Location[]> => {
  const response = await api.get<Location[]>('/locations');
  return response.data;
};

export const createLocation = async (location: Location): Promise<Location> => {
  const response = await api.post<Location>('/locations', location);
  return response.data;
};

export const deleteLocation = async (id: string): Promise<void> => {
  await api.delete(`/locations/${id}`);
};

