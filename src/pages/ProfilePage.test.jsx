import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import ProfilePage from './ProfilePage';

afterEach(() => cleanup());

describe('ProfilePage', () => {
  it('renders the profile name', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Nightlife Explorer')).toBeInTheDocument();
  });

  it('renders the member tier badge', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Beta Insider')).toBeInTheDocument();
  });

  it('renders the location', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Yangon, Myanmar')).toBeInTheDocument();
  });

  it('renders profile stats', () => {
    render(<ProfilePage />);
    expect(screen.getAllByText('Saved Venues').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Favorite Genre')).toBeInTheDocument();
    expect(screen.getByText('Ticket Credits')).toBeInTheDocument();
    expect(screen.getByText('Events Attended')).toBeInTheDocument();
  });

  it('renders stat values', () => {
    render(<ProfilePage />);
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('$30')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders music preferences section', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Music Preferences')).toBeInTheDocument();
  });

  it('renders active genre preferences highlighted', () => {
    render(<ProfilePage />);
    const techno = screen.getAllByText('Techno');
    expect(techno.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('EDM')).toBeInTheDocument();
    expect(screen.getByText('Hip-Hop')).toBeInTheDocument();
  });

  it('renders inactive genre preferences', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Live Bands')).toBeInTheDocument();
    expect(screen.getByText('House')).toBeInTheDocument();
    expect(screen.getByText('Underground')).toBeInTheDocument();
  });

  it('renders saved venues section with venue data', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Warehouse 19')).toBeInTheDocument();
    expect(screen.getByText('NOIR Rooftop')).toBeInTheDocument();
    expect(screen.getByText('Atlas Terrace')).toBeInTheDocument();
    expect(screen.getByText('The Foundry')).toBeInTheDocument();
  });

  it('renders venue locations', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Dagon Township')).toBeInTheDocument();
    expect(screen.getByText('Bahan Township')).toBeInTheDocument();
  });

  it('renders venue ratings', () => {
    render(<ProfilePage />);
    expect(screen.getByText(/4\.8/)).toBeInTheDocument();
    expect(screen.getByText(/4\.6/)).toBeInTheDocument();
  });
});
