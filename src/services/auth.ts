import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  username: string;
  name: string;
  role: string;
  district?: string;
  state?: string;
  policeStation?: string;
  token: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const { token, user } = response.data;
    setAuthToken(token);
    return { ...user, token };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
    throw error;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('token', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function removeAuthToken(): void {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}