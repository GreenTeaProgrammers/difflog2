import createApi from './api';
import { Diff } from '../types/diff';

const api = createApi("http://localhost:8081");

export const fetchDiffs = async (locationId: string): Promise<Diff[]> => {
  const response = await api.get<Diff[]>(`/locations/${locationId}/diffs`);
  return response.data;
};

export const addDiff = async (diff: Diff): Promise<Diff> => {
  const response = await api.post<Diff>('/diffs', diff);
  return response.data;
};

