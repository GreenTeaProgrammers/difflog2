import api from './api';
import { Capture } from '../types/capture';

export const fetchCaptures = async (locationId: string): Promise<Capture[]> => {
  const response = await api.get<Capture[]>(`/locations/${locationId}/captures`);
  return response.data;
};

export const addCapture = async (capture: { locationId: string, file: File }): Promise<Capture> => {
  const formData = new FormData();
  formData.append('location_id', capture.locationId);
  formData.append('image', capture.file);

  const response = await api.post<Capture>('/captures', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const deleteCapture = async (id: string): Promise<void> => {
  await api.delete(`/captures/${id}`);
};
