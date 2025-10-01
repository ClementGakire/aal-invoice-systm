import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (
    profileData: Partial<User> & {
      currentPassword?: string;
      newPassword?: string;
    }
  ) => Promise<boolean>;
  updateProfilePicture: (imageData: string) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://aal-front-end.vercel.app' // Production Vercel URL
    : 'http://localhost:3000'; // For local development API server

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
          const { user: savedUser, token, timestamp } = JSON.parse(savedAuth);

          // Check if session is still valid (24 hours)
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;

          if (!isExpired && savedUser && token) {
            // Convert date strings back to Date objects
            const user: User = {
              ...savedUser,
              createdAt: new Date(savedUser.createdAt),
              updatedAt: new Date(savedUser.updatedAt),
            };

            setUser(user);
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
      console.log('🔐 Attempting login for:', email);

      const response = await fetch(`${API_BASE_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        console.log('✅ Login successful for:', data.user.name);

        // Convert date strings back to Date objects
        const user: User = {
          ...data.user,
          createdAt: new Date(data.user.createdAt),
          updatedAt: new Date(data.user.updatedAt),
        };

        setUser(user);
        setIsAuthenticated(true);

        // Save to localStorage
        localStorage.setItem(
          'aal_auth',
          JSON.stringify({
            user,
            token: data.token,
            timestamp: Date.now(),
          })
        );

        return true;
      } else {
        console.log('❌ Login failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('aal_auth');
  };

  const updateProfile = async (
    profileData: Partial<User> & {
      currentPassword?: string;
      newPassword?: string;
    }
  ): Promise<boolean> => {
    if (!user) {
      console.error('No user logged in');
      return false;
    }

    try {
      console.log('🔄 Updating profile for user:', user.id);

      const response = await fetch(
        `${API_BASE_URL}/api/profile?userId=${user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(profileData),
        }
      );

      const data = await response.json();

      if (response.ok && data.user) {
        console.log('✅ Profile updated successfully');

        // Convert date strings back to Date objects
        const updatedUser: User = {
          ...data.user,
          createdAt: new Date(data.user.createdAt),
          updatedAt: new Date(data.user.updatedAt),
        };

        setUser(updatedUser);

        // Update localStorage
        const savedAuth = localStorage.getItem('aal_auth');
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          localStorage.setItem(
            'aal_auth',
            JSON.stringify({
              ...authData,
              user: updatedUser,
              timestamp: Date.now(),
            })
          );
        }

        return true;
      } else {
        console.log('❌ Profile update failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('🚨 Profile update error:', error);
      return false;
    }
  };

  const updateProfilePicture = async (imageData: string): Promise<boolean> => {
    if (!user) {
      console.error('No user logged in');
      return false;
    }

    try {
      console.log('📸 Updating profile picture for user:', user.id);

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          imageData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        console.log('✅ Profile picture updated successfully');

        // Convert date strings back to Date objects
        const updatedUser: User = {
          ...data.user,
          createdAt: new Date(data.user.createdAt),
          updatedAt: new Date(data.user.updatedAt),
        };

        setUser(updatedUser);

        // Update localStorage
        const savedAuth = localStorage.getItem('aal_auth');
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          localStorage.setItem(
            'aal_auth',
            JSON.stringify({
              ...authData,
              user: updatedUser,
              timestamp: Date.now(),
            })
          );
        }

        return true;
      } else {
        console.log('❌ Profile picture update failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('🚨 Profile picture update error:', error);
      return false;
    }
  };

  const value: AuthState = {
    isAuthenticated,
    user,
    login,
    logout,
    updateProfile,
    updateProfilePicture,
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
