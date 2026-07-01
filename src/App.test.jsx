import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

afterEach(() => cleanup());

function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App (with React Router)', () => {
  it('renders the NOX brand and tagline on any page', () => {
    renderApp();
    expect(screen.getAllByRole('heading', { name: 'NOX' }).length).toBeGreaterThan(0);
    expect(screen.getByText('Own The Night')).toBeInTheDocument();
  });

  it('renders the Discover page at /', () => {
    renderApp('/');
    expect(screen.getByText(/Yangon Beta Launch/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explore Events' })).toBeInTheDocument();
  });

  it('renders the Venues page at /venues', () => {
    renderApp('/venues');
    expect(screen.getByText('Venue Network')).toBeInTheDocument();
    expect(screen.getByText('Warehouse 19')).toBeInTheDocument();
  });

  it('renders the Promoters page at /promoters', () => {
    renderApp('/promoters');
    expect(screen.getByText('Promoter Console')).toBeInTheDocument();
    expect(screen.getByText('Live Event Analytics')).toBeInTheDocument();
    expect(screen.getByText('1,248')).toBeInTheDocument();
  });

  it('renders the Tickets page at /tickets', () => {
    renderApp('/tickets');
    expect(screen.getByText('Digital Entry')).toBeInTheDocument();
    expect(screen.getByText('QR Entry Pass')).toBeInTheDocument();
  });

  it('renders the Profile page at /profile', () => {
    renderApp('/profile');
    expect(screen.getByText('Beta Insider')).toBeInTheDocument();
    expect(screen.getAllByText('Saved Venues').length).toBeGreaterThan(0);
  });

  it('shows notification when Get App is clicked', () => {
    renderApp('/');
    const getApp = screen.getByRole('button', { name: 'Get App' });
    fireEvent.click(getApp);
    expect(screen.getByText('Beta access unlocked')).toBeInTheDocument();
  });

  it('navigates to Tickets when Explore Events is clicked on Discover', () => {
    renderApp('/');
    fireEvent.click(screen.getByRole('button', { name: 'Explore Events' }));
    expect(screen.getByText('Digital Entry')).toBeInTheDocument();
  });

  it('navigates to Promoters when View Demo is clicked on Discover', () => {
    renderApp('/');
    fireEvent.click(screen.getByRole('button', { name: 'View Demo' }));
    expect(screen.getByText('Promoter Console')).toBeInTheDocument();
  });
});
