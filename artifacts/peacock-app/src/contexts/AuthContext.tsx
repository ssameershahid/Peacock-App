import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, clearToken, getToken } from '@/lib/api';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'TOURIST' | 'DRIVER' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  country?: string;
  profileImageUrl?: string;
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
  updateUser: (data: Partial<AuthUser>) => void;
}

function normalizeUser(raw: any): AuthUser {
  return {
    userId: raw.userId ?? raw.id,
    email: raw.email,
    role: raw.role,
    firstName: raw.firstName,
    lastName: raw.lastName,
    name: (raw.name ?? [raw.firstName, raw.lastName].filter(Boolean).join(' ')) || raw.email,
    phone: raw.phone,
    country: raw.country,
    profileImageUrl: raw.profileImageUrl,
  };
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
    api.get<any>('/auth/me')
      .then(data => setUser(normalizeUser(data)))
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: any }>('/auth/login', { email, password });
    setToken(data.token);
    setUser(normalizeUser(data.user));
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post<{ token: string; user: any }>('/auth/register', {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      country: data.country,
    });
    setToken(res.token);
    setUser(normalizeUser(res.user));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...data } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
