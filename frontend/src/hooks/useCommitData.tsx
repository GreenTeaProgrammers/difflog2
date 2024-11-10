import { useState, useEffect } from 'react';
import api from '../../services/api';

interface CommitData {
  date: string;
  value: number;
}

export const useCommitData = (location: string) => {
  const [data, setData] = useState<CommitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/commits/${location}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  return { data, loading, error };
};