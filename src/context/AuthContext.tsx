import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, Role } from '../types';
import { getAuthToken, removeAuthToken, setAuthToken } from '../services/auth';

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (requiredRoles: Role[]) => boolean;
  canEditCase: () => boolean;
  canChangeStatus: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        // Parse the token to get user information
        // In a real app with proper JWT, we would use jwtDecode
        // For our custom token format: jwt-token-{userId}-{role}-{timestamp}
        const tokenParts = token.split('-');
        if (tokenParts.length >= 4 && tokenParts[0] === 'jwt' && tokenParts[1] === 'token') {
          const userId = tokenParts[2];
          const role = tokenParts[3];
          
          setUser({
            id: userId,
            name: 'User', // This would come from the token in a real app
            email: 'user@example.com', // This would come from the token in a real app
            role: role as Role,
          });
        } else {
          // Try to decode as a JWT
          try {
            const decoded = jwtDecode<any>(token);
            setUser({
              id: decoded.id || decoded._id,
              name: decoded.name,
              email: decoded.email,
              role: decoded.role as Role,
              district: decoded.district,
              state: decoded.state,
              policeStation: decoded.policeStation
            });
          } catch (jwtError) {
            console.error('Invalid token format:', jwtError);
            removeAuthToken();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error processing token:', error);
        removeAuthToken();
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    try {
      setAuthToken(token);
      
      // Parse the token to get user information
      // In a real app with proper JWT, we would use jwtDecode
      // For our custom token format: jwt-token-{userId}-{role}-{timestamp}
      const tokenParts = token.split('-');
      if (tokenParts.length >= 4 && tokenParts[0] === 'jwt' && tokenParts[1] === 'token') {
        const userId = tokenParts[2];
        const role = tokenParts[3];
        
        setUser({
          id: userId,
          name: 'User', // This would come from the token in a real app
          email: 'user@example.com', // This would come from the token in a real app
          role: role as Role,
        });
      } else {
        // Try to decode as a JWT
        try {
          const decoded = jwtDecode<any>(token);
          setUser({
            id: decoded.id || decoded._id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role as Role,
            district: decoded.district,
            state: decoded.state,
            policeStation: decoded.policeStation
          });
        } catch (jwtError) {
          console.error('Invalid token format:', jwtError);
          throw new Error('Invalid token format');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      removeAuthToken();
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  // Check if user has permission based on role
  const hasPermission = (requiredRoles: Role[]) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  // Check if user can edit case details
  const canEditCase = () => {
    if (!user) return false;
    return ['admin', 'investigator'].includes(user.role);
  };

  // Check if user can change case status
  const canChangeStatus = () => {
    if (!user) return false;
    return ['admin', 'investigator'].includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isLoading,
      hasPermission,
      canEditCase,
      canChangeStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}