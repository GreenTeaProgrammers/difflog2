import api from './api';
import { Capture } from '../types/capture';

export const fetchCaptures = async (locationId: string): Promise<Capture[]> => {
  const response = await api.get<Capture[]>(`/locations/${locationId}/captures`);
  return response.data;
};

export const addCapture = async (capture: Capture): Promise<Capture> => {
  const response = await api.post<Capture>('/captures', capture);
  return response.data;
};

export const deleteCapture = async (id: string): Promise<void> => {
  await api.delete(`/captures/${id}`);
};

