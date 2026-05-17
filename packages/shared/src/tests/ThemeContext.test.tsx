import { fireEvent,render, screen } from '@testing-library/react';
import { beforeEach,describe, expect, it } from 'vitest';

import { ThemeProvider, useTheme } from '../ThemeContext';

function TestConsumer() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>Toggle</button>
      <button data-testid="light-btn" onClick={() => setTheme('light')}>Light</button>
      <button data-testid="dark-btn" onClick={() => setTheme('dark')}>Dark</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('provides light theme by default', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
  });

  it('sets data-theme attribute on the html element', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('toggles from light to dark via toggleTheme', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('toggle-btn'));
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('toggles back to light on second toggle', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('toggle-btn'));
    fireEvent.click(screen.getByTestId('toggle-btn'));
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
  });

  it('setTheme sets the theme directly', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('dark-btn'));
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');

    fireEvent.click(screen.getByTestId('light-btn'));
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
  });

  it('persists theme to localStorage', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('dark-btn'));
    expect(localStorage.getItem('theme')).toBe('dark');

    fireEvent.click(screen.getByTestId('light-btn'));
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('reads initial theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
  });
});

describe('useTheme outside ThemeProvider', () => {
  it('throws when used outside ThemeProvider', () => {
    function BadComponent() {
      useTheme();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow(
      'useTheme must be used within ThemeProvider',
    );
  });
});
