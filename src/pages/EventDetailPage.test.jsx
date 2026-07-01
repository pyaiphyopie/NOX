import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EventDetailPage from './EventDetailPage';

afterEach(() => cleanup());

function renderPage(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/event/${id}`]}>
      <Routes>
        <Route path="/event/:id" element={<EventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EventDetailPage', () => {
  it('renders the event title for a valid event', () => {
    renderPage('1');
    expect(screen.getByText('NEON DISTRICT')).toBeInTheDocument();
  });

  it('renders venue name', () => {
    renderPage('1');
    expect(screen.getByText('Warehouse 19')).toBeInTheDocument();
  });

  it('renders the event description', () => {
    renderPage('1');
    expect(screen.getByText(/premier underground techno/)).toBeInTheDocument();
  });

  it('renders event tags', () => {
    renderPage('1');
    expect(screen.getByText('18+')).toBeInTheDocument();
    expect(screen.getByText('Indoor')).toBeInTheDocument();
    expect(screen.getByText('Full Bar')).toBeInTheDocument();
  });

  it('renders the lineup', () => {
    renderPage('1');
    expect(screen.getByText('DJ KYAW')).toBeInTheDocument();
    expect(screen.getByText('Neon Pulse')).toBeInTheDocument();
    expect(screen.getByText('Underground Syndicate')).toBeInTheDocument();
  });

  it('renders the capacity bar with attendance data', () => {
    renderPage('1');
    expect(screen.getByText('Capacity')).toBeInTheDocument();
    expect(screen.getByText('842 / 1,200')).toBeInTheDocument();
  });

  it('renders the price', () => {
    renderPage('1');
    expect(screen.getByText('$12')).toBeInTheDocument();
  });

  it('renders the sold percentage', () => {
    renderPage('1');
    expect(screen.getByText('70% sold')).toBeInTheDocument();
  });

  it('renders the Purchase Ticket button', () => {
    renderPage('1');
    expect(screen.getByRole('button', { name: 'Purchase Ticket' })).toBeInTheDocument();
  });

  it('renders back link to Discover', () => {
    renderPage('1');
    const backLink = screen.getByRole('link', { name: /Back to Discover/ });
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('renders the event image', () => {
    renderPage('1');
    const img = screen.getByRole('img', { name: 'NEON DISTRICT' });
    expect(img).toBeInTheDocument();
  });

  it('shows Event Not Found for an invalid event id', () => {
    renderPage('999');
    expect(screen.getByText('Event Not Found')).toBeInTheDocument();
  });

  it('shows back link on not-found page', () => {
    renderPage('999');
    const link = screen.getByRole('link', { name: /Back to Discover/ });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders a different event correctly', () => {
    renderPage('3');
    expect(screen.getByText('SKYLINE SIGNAL')).toBeInTheDocument();
    expect(screen.getByText('Atlas Terrace')).toBeInTheDocument();
    expect(screen.getByText('$20')).toBeInTheDocument();
  });
});
