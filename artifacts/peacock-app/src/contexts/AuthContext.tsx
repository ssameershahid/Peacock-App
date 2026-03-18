import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, clearToken, getToken } from '@/lib/api';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'TOURIST' | 'DRIVER' | 'ADMIN';
  name?: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from stored token on mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.get<{ user: AuthUser }>('/auth/me')
      .then(data => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post<{ token: string; user: AuthUser }>('/auth/register', {
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`.trim(),
      country: data.country,
      role: 'TOURIST',
    });
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
