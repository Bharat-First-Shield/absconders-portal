import api from './api';
import { jwtDecode } from 'jwt-decode';

export interface LoginCredentials {
  identifier: string;
  password: string;
  state?: string;
  district?: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegistrationData {
  name: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'investigator' | 'public';
  policeStation?: string;
  district?: string;
  state?: string;
}

export async function register(data: RegistrationData): Promise<LoginResponse> {
  try {
    // In a real app, this would be an API call
    // For now, we'll simulate registration using mock data
    const mockUsers = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        state: 'Maharashtra',
        district: 'Mumbai',
        role: 'admin',
        name: 'Admin User'
      }
    ];

    // Check if username or email already exists
    const userExists = mockUsers.some(u => 
      u.username === data.username || u.email === data.email
    );

    if (userExists) {
      throw new Error('Username or email already exists');
    }

    // Create a mock token for the new user
    const token = `jwt-token-${Date.now()}-${data.role}`;
    
    // Store token
    localStorage.setItem('token', token);
    
    return { token };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function login(credentials: LoginCredentials): Promise<any> {
  try {
    // In a real app, this would be an API call
    // For now, we'll simulate authentication using the mock data
    const mockUsers = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        state: 'Maharashtra',
        district: 'Mumbai',
        role: 'admin',
        name: 'Admin User'
      },
      {
        id: '2',
        username: 'investigator',
        email: 'investigator@example.com',
        password: 'investigator123',
        state: 'Maharashtra',
        district: 'Pune',
        role: 'investigator',
        name: 'Investigator User'
      }
    ];

    // Check if user exists
    const user = mockUsers.find(u => 
      (u.username === credentials.identifier || u.email === credentials.identifier) &&
      u.password === credentials.password &&
      u.state === credentials.state &&
      u.district === credentials.district
    );

    if (!user) {
      throw new Error('Invalid credentials or location');
    }

    // Create a mock token
    const token = `jwt-token-${user.id}-${user.role}-${Date.now()}`;
    
    // Store token
    localStorage.setItem('token', token);
    
    return { token };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('token');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getUsernameFromEmail(email: string): string {
  return email.split('@')[0];
}