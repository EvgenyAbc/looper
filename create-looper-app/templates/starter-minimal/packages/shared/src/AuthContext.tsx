import { createContext, type ReactNode,useCallback, useContext, useEffect, useState } from 'react';

import type { AuthContextValue, AuthState, LoginCredentials,User } from './types';

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE = '/api';

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('jwt');
    return {
      user: null,
      token: null,
      isLoading: Boolean(token),
      isAuthenticated: false,
    };
  });

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error('Session expired');
        return res.json() as Promise<User>;
      })
      .then(user => setState({ user, token, isLoading: false, isAuthenticated: true }))
      .catch(() => {
        localStorage.removeItem('jwt');
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      });
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login failed' }));
      setState(prev => ({ ...prev, isLoading: false }));
      throw new Error(err.message);
    }
    const { token, user } = await res.json() as { token: string; user: User };
    localStorage.setItem('jwt', token);
    setState({ user, token, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  const getToken = useCallback(() => state.token, [state.token]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { AuthContext, AuthProvider, useAuth };
export type { AuthContextValue };
