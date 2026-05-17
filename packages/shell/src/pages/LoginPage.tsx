import { useActionState } from 'react';
import { Navigate,useNavigate } from 'react-router';

import { useAuth } from '@looper/shared';

interface LoginFormState {
  error: string | null;
}

async function loginAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  if (!username || !password) return { error: 'Username and password are required' };
  // The actual login is handled by AuthContext — we return the data for the form
  return { error: null };
}

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [state, formAction, isPending] = useActionState(loginAction, { error: null });

  // Already authenticated — redirect home
  if (auth.isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await auth.login({
        username: data.get('username') as string,
        password: data.get('password') as string,
      });
      navigate('/', { replace: true });
    } catch {
      // Error is handled via the form state
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Sign in</h1>
        <p className="login-hint">
          Demo credentials: <code>admin</code> and <code>admin</code>.
        </p>

        <form action={formAction} onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              defaultValue="admin"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              defaultValue="admin"
              required
            />
          </div>

          {isPending && <p className="loading">Signing in…</p>}
          {state.error && <p className="error">{state.error}</p>}

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={isPending}>
            {isPending ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
