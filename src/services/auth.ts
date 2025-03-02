import { jwtDecode } from 'jwt-decode';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { mockUsers } from '../utils/mockData';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  policeStation?: string;
  role?: 'admin' | 'investigator' | 'public';
  district?: string;
  state?: string;
}

export interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  district?: string;
  state?: string;
  policeStation?: string;
  token: string;
}

// Generate JWT token (in a real app, this would use a proper JWT library)
const generateToken = (userId: string, role: string): string => {
  return `jwt-token-${userId}-${role}-${Date.now()}`;
};

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    // Find user by email
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // In a real app, we would compare hashed passwords
    // For demo purposes, we'll accept any password
    
    // Generate token
    const token = generateToken(user._id.toString(), user.role);
    
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      district: user.district,
      state: user.state,
      policeStation: user.policeStation,
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function register(userData: RegisterData): Promise<LoginResponse> {
  try {
    // Validate required fields
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    // Prepare name if firstName and lastName are provided
    let name = userData.name;
    if (!name && userData.firstName && userData.lastName) {
      name = `${userData.firstName} ${userData.lastName}`;
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    
    if (existingUser) {
      throw new Error('Email already in use');
    }
    
    // Generate a new user ID
    const newUserId = uuidv4();
    
    // Generate token
    const token = generateToken(newUserId, userData.role || 'public');
    
    return {
      _id: newUserId,
      name: name || userData.email.split('@')[0],
      email: userData.email,
      role: userData.role || 'public',
      district: userData.district,
      state: userData.state,
      policeStation: userData.policeStation,
      token
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export function getUsernameFromEmail(email: string): string {
  return email.split('@')[0];
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