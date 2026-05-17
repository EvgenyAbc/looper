import 'react/jsx-dev-runtime';
import 'react/jsx-runtime';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { AuthProvider, CounterProvider, looperDebug,ThemeProvider } from '@looper/shared';

looperDebug('bootstrap', 'start');
import { shellRouter } from './router';

import './styles.css';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <CounterProvider>
          <RouterProvider router={shellRouter} />
        </CounterProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
