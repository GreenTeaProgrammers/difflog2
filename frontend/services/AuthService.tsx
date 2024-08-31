import createApi from './api';
import { LoginInput, RegisterInput, User } from '../types/user';
import { AxiosError } from 'axios';

const api = createApi("http://localhost:8083");

export const register = async (input: RegisterInput): Promise<User> => {
  try {
    const response = await api.post<User>('/register', input);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || 'Registration failed due to server error.';
      console.error('Registration failed:', message);
      throw new Error(message);
    } else {
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred during registration.');
    }
  }
};

export const login = async (
  input: LoginInput
): Promise<{ token: string; username: string; message: string }> => {
  try {
    const response = await api.post<{ token: string; username: string; message: string }>(
      '/login',
      input
    );
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('username', response.data.username);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || 'Login failed due to server error.';
      console.error('Login failed:', message);
      throw new Error(message);
    } else {
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred during login.');
    }
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || 'Logout failed due to server error.';
      console.error('Logout failed:', message);
      throw new Error(message);
    } else {
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred during logout.');
    }
  }
};

export const getProfileByUsername = async (username: string): Promise<User | null> => {
  try {
    const response = await api.get<User>(`/profile/${username}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || 'Failed to fetch profile due to server error.';
      console.error('Failed to fetch profile:', message);
      return null;
    } else {
      console.error('Unexpected error:', error);
      return null;
    }
  }
};