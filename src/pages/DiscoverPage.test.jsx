import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import DiscoverPage from './DiscoverPage';

afterEach(() => cleanup());

function renderPage() {
  return render(
    <MemoryRouter>
      <DiscoverPage />
    </MemoryRouter>,
  );
}

describe('DiscoverPage', () => {
  it('renders the hero headline', () => {
    renderPage();
    const headings = screen.getAllByRole('heading', { level: 2 });
    const heroHeading = headings.find((h) => h.textContent.includes('Urban'));
    expect(heroHeading).toBeDefined();
    expect(heroHeading.textContent).toContain('Nightlife');
    expect(heroHeading.textContent).toContain('Infrastructure');
  });

  it('renders the Yangon beta badge', () => {
    renderPage();
    expect(screen.getByText(/Yangon Beta Launch/)).toBeInTheDocument();
  });

  it('renders the Explore Events button', () => {
    renderPage();
    expect(screen.getByText('Explore Events')).toBeInTheDocument();
  });

  it('renders the View Demo button', () => {
    renderPage();
    expect(screen.getByText('View Demo')).toBeInTheDocument();
  });

  it('renders hero stat metrics', () => {
    renderPage();
    expect(screen.getByText('300+')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
    expect(screen.getByText('20+')).toBeInTheDocument();
  });

  it('renders all category filter buttons', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Techno' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hip-Hop' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EDM' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Live Bands' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rooftop' })).toBeInTheDocument();
  });

  it('renders all 5 events by default', () => {
    renderPage();
    expect(screen.getByText('NEON DISTRICT')).toBeInTheDocument();
    expect(screen.getByText('AFTERHOURS')).toBeInTheDocument();
    expect(screen.getByText('SKYLINE SIGNAL')).toBeInTheDocument();
    expect(screen.getByText('AMPLIFIED CITY')).toBeInTheDocument();
    expect(screen.getByText('ELECTRIC MONSOON')).toBeInTheDocument();
  });

  it('filters events when a category tag is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'EDM' }));
    expect(screen.getByText('ELECTRIC MONSOON')).toBeInTheDocument();
    expect(screen.queryByText('NEON DISTRICT')).not.toBeInTheDocument();
  });

  it('resets filter when All tag is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Techno' }));
    expect(screen.queryByText('AFTERHOURS')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText('AFTERHOURS')).toBeInTheDocument();
    expect(screen.getByText('NEON DISTRICT')).toBeInTheDocument();
  });

  it('renders bottom stats section', () => {
    renderPage();
    expect(screen.getByText('15K+')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText('98%')).toBeInTheDocument();
  });

  it('renders the phone preview header', () => {
    renderPage();
    expect(screen.getByText("Tonight's Pulse", { exact: false })).toBeInTheDocument();
  });

  it('renders the phone preview tabs', () => {
    renderPage();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Tickets')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
