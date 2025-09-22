import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

// Mock users for authentication
const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'John Administrator',
    email: 'admin@aal.com',
    role: 'admin',
    department: 'IT',
    phone: '+1-555-0101',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'u2',
    name: 'Sarah Finance',
    email: 'finance@aal.com',
    role: 'finance',
    department: 'Finance',
    phone: '+1-555-0102',
    isActive: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'u3',
    name: 'Mike Operations',
    email: 'operations@aal.com',
    role: 'operations',
    department: 'Operations',
    phone: '+1-555-0103',
    isActive: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

// Mock password validation
const mockPasswords: Record<string, string> = {
  'admin@aal.com': 'admin123',
  'finance@aal.com': 'finance123',
  'operations@aal.com': 'ops123',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthState = () => {
      try {
        const savedAuth = localStorage.getItem('aal_auth');
        if (savedAuth) {
          const { user: savedUser, timestamp } = JSON.parse(savedAuth);

          // Check if session is still valid (24 hours)
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;

          if (!isExpired && savedUser) {
            setUser(savedUser);
            setIsAuthenticated(true);
          } else {
            // Clear expired session
            localStorage.removeItem('aal_auth');
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        localStorage.removeItem('aal_auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check credentials
      if (mockPasswords[email] === password) {
        const foundUser = mockUsers.find((u) => u.email === email);

        if (foundUser && foundUser.isActive) {
          setUser(foundUser);
          setIsAuthenticated(true);

          // Save to localStorage
          localStorage.setItem(
            'aal_auth',
            JSON.stringify({
              user: foundUser,
              timestamp: Date.now(),
            })
          );

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('aal_auth');
  };

  const value: AuthState = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
