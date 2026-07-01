import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import VenuesPage from './VenuesPage';

afterEach(() => cleanup());

describe('VenuesPage', () => {
  it('renders the page heading', () => {
    render(<VenuesPage />);
    expect(screen.getByText('Venue Network')).toBeInTheDocument();
  });

  it('renders the section subtitle', () => {
    render(<VenuesPage />);
    expect(
      screen.getByRole('heading', { name: /Partner venues powering/i }),
    ).toBeInTheDocument();
  });

  it('renders all venue names', () => {
    render(<VenuesPage />);
    expect(screen.getByText('Warehouse 19')).toBeInTheDocument();
    expect(screen.getByText('NOIR Rooftop')).toBeInTheDocument();
    expect(screen.getByText('Atlas Terrace')).toBeInTheDocument();
    expect(screen.getByText('The Foundry')).toBeInTheDocument();
    expect(screen.getByText('Pulse Arena')).toBeInTheDocument();
  });

  it('renders venue types', () => {
    render(<VenuesPage />);
    expect(screen.getByText('Club')).toBeInTheDocument();
    expect(screen.getByText('Rooftop Bar')).toBeInTheDocument();
    expect(screen.getByText('Open-Air')).toBeInTheDocument();
    expect(screen.getByText('Live House')).toBeInTheDocument();
    expect(screen.getByText('Arena')).toBeInTheDocument();
  });

  it('renders venue capacities', () => {
    render(<VenuesPage />);
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('2,500')).toBeInTheDocument();
  });

  it('renders venue locations', () => {
    render(<VenuesPage />);
    expect(screen.getByText('Dagon Township')).toBeInTheDocument();
    expect(screen.getByText('Bahan Township')).toBeInTheDocument();
    expect(screen.getByText('Sanchaung')).toBeInTheDocument();
    expect(screen.getByText('Ahlone Township')).toBeInTheDocument();
    expect(screen.getByText('Hlaing Township')).toBeInTheDocument();
  });

  it('renders venue ratings', () => {
    render(<VenuesPage />);
    expect(screen.getByText(/4\.8/)).toBeInTheDocument();
    expect(screen.getByText(/4\.9/)).toBeInTheDocument();
  });

  it('renders Type, Capacity, Location labels for each venue', () => {
    render(<VenuesPage />);
    expect(screen.getAllByText('Type').length).toBe(5);
    expect(screen.getAllByText('Capacity').length).toBe(5);
    expect(screen.getAllByText('Location').length).toBe(5);
  });
});
