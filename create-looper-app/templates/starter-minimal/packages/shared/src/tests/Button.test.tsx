import { fireEvent,render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Button } from '../Button';
import { ThemeProvider } from '../ThemeContext';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Button', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders children text', () => {
    renderWithTheme(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders with default variant and size', () => {
    renderWithTheme(<Button>Default</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('btn');
    expect(btn.className).toContain('btn-primary');
    expect(btn.className).toContain('btn-md');
  });

  it('applies variant class', () => {
    renderWithTheme(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('btn-secondary');
  });

  it('applies size class', () => {
    renderWithTheme(<Button size="lg">Large</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('btn-lg');
  });

  it('applies ghost variant class', () => {
    renderWithTheme(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('btn-ghost');
  });

  it('applies custom className', () => {
    renderWithTheme(<Button className="my-custom-class">Custom</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('my-custom-class');
  });

  it('handles click events', () => {
    let clicked = false;
    renderWithTheme(
      <Button onClick={() => { clicked = true; }}>Click</Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(clicked).toBe(true);
  });

  it('respects disabled prop', () => {
    renderWithTheme(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('does not fire onClick when disabled', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <Button disabled onClick={handleClick}>Disabled</Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('uses type="submit" when specified', () => {
    renderWithTheme(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('defaults to type="button"', () => {
    renderWithTheme(<Button>Default</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('renders with light theme class', () => {
    renderWithTheme(<Button>Theme test</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('btn-light');
  });
});
