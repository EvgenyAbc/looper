import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { AuthProvider, useAuth } from '../AuthContext';

function TestConsumer() {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">
        {isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'anonymous'}
      </div>
      {user && <div data-testid="username">{user.username}</div>}
      <button data-testid="login-btn" onClick={() => login({ username: 'admin', password: 'admin' })}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}

const mockUser = { id: '1', username: 'admin', email: 'admin@test.com', role: 'admin' as const };
const mockToken = 'eyJhbGciOiJIUzI1NiJ9.mock-token';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();

    globalThis.fetch = vi.fn();
  });

  it('shows loading then anonymous when no token', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous');
    });
  });

  it('login sets authenticated state with user', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken, user: mockUser }),
      });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous');
    });

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });
    expect(screen.getByTestId('username')).toHaveTextContent('admin');
  });

  it('login stores jwt in localStorage', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken, user: mockUser }),
      });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(localStorage.getItem('jwt')).toBe(mockToken);
    });
  });

  it('logout clears auth state and token', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken, user: mockUser }),
      });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    fireEvent.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous');
    });
    expect(localStorage.getItem('jwt')).toBeNull();
  });

  it('login with wrong credentials shows error', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
      });

    function LoginErrorConsumer() {
      const { isAuthenticated, isLoading, login } = useAuth();
      const handleLogin = async () => {
        try {
          await login({ username: 'admin', password: 'admin' });
        } catch {
          /* expected — component-level error handling */
        }
      };
      return (
        <div>
          <div data-testid="auth-status">
            {isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'anonymous'}
          </div>
          <button data-testid="login-btn" onClick={handleLogin}>Login</button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <LoginErrorConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous');
    });
  });

  it('uses stored token to restore session on mount', async () => {
    localStorage.setItem('jwt', mockToken);

    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });
    expect(screen.getByTestId('username')).toHaveTextContent('admin');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
        }),
      }),
    );
  });

  it('clears expired token on mount', async () => {
    localStorage.setItem('jwt', mockToken);

    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous');
    });
    expect(localStorage.getItem('jwt')).toBeNull();
  });
});

describe('useAuth outside AuthProvider', () => {
  it('throws when used outside AuthProvider', () => {
    function BadComponent() {
      useAuth();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow(
      'useAuth must be used within AuthProvider',
    );
  });
});
