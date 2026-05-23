import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from './App';

afterEach(() => {
  cleanup();
});

describe('App Component', () => {
  it('renders the NOX prototype landing experience', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'NOX' })).toBeInTheDocument();
    expect(screen.getByText('Own The Night')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explore Events' })).toBeInTheDocument();
  });

  it('filters events and opens a ticket from a button click', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'EDM' }));

    expect(screen.getByText('ELECTRIC MONSOON')).toBeInTheDocument();
    expect(screen.queryByText('NEON DISTRICT')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ELECTRIC MONSOON/i }));

    expect(screen.getByText('Selected Ticket')).toBeInTheDocument();
    expect(screen.getAllByText('ELECTRIC MONSOON').length).toBeGreaterThan(0);
  });
});
