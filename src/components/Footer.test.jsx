import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Footer from './Footer';

afterEach(() => cleanup());

describe('Footer', () => {
  it('renders the NOX brand name', () => {
    render(<Footer />);
    expect(screen.getByRole('heading', { name: 'NOX' })).toBeInTheDocument();
  });

  it('renders the platform tagline', () => {
    render(<Footer />);
    expect(screen.getByText('Urban Entertainment Infrastructure Platform')).toBeInTheDocument();
  });

  it('renders all city names', () => {
    render(<Footer />);
    expect(
      screen.getByText('Yangon • Bangkok • Jakarta • Manila • Ho Chi Minh City'),
    ).toBeInTheDocument();
  });

  it('renders as a footer element', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });
});
