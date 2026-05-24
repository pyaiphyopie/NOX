import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import NoxPrototype from './NoxPrototype';

afterEach(() => cleanup());

// ── Helper ────────────────────────────────────────
function renderNox() {
  return render(<NoxPrototype />);
}

// ── Navigation & Brand ────────────────────────────
describe('Navigation', () => {
  it('renders the NOX brand and tagline', () => {
    renderNox();
    expect(screen.getByRole('heading', { name: 'NOX' })).toBeInTheDocument();
    expect(screen.getByText('Own The Night')).toBeInTheDocument();
  });

  it('renders desktop nav links', () => {
    renderNox();
    const discoverButtons = screen.getAllByRole('button', { name: 'Discover' });
    expect(discoverButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: 'Venues' }).length).toBeGreaterThanOrEqual(1);
  });

  it('shows a notice when "Get App" is clicked', () => {
    renderNox();
    fireEvent.click(screen.getByRole('button', { name: 'Get App' }));
    expect(screen.getByText('Beta access unlocked')).toBeInTheDocument();
  });

  it('closes notification when X is clicked', () => {
    renderNox();
    fireEvent.click(screen.getByRole('button', { name: 'Get App' }));
    const closeButton = screen.getByRole('button', { name: /close notification/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText('Beta access unlocked')).not.toBeInTheDocument();
  });
});

// ── Hero Section ──────────────────────────────────
describe('Hero Section', () => {
  it('displays headline and metrics', () => {
    renderNox();
    const headings = screen.getAllByRole('heading', { level: 2 });
    const heroHeading = headings.find((h) => h.textContent.includes('Urban'));
    expect(heroHeading).toBeDefined();
    expect(heroHeading.textContent).toContain('Urban');
    expect(heroHeading.textContent).toContain('Nightlife');
    expect(heroHeading.textContent).toContain('Infrastructure');
    expect(screen.getByText('300+')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
    expect(screen.getByText('20+')).toBeInTheDocument();
  });

  it('displays the Yangon beta launch badge', () => {
    renderNox();
    expect(screen.getByText(/Yangon Beta Launch/i)).toBeInTheDocument();
  });

  it('Explore Events button switches phone to Discover tab', () => {
    renderNox();
    fireEvent.click(screen.getByRole('button', { name: 'Explore Events' }));
    // "Tonight's Pulse" is part of a combined text node in the phone header
    expect(screen.getByText((content) => content.includes("Tonight's Pulse"))).toBeInTheDocument();
    expect(screen.getByText('AFTER DARK')).toBeInTheDocument();
  });

  it('View Demo triggers notice and switches to Create tab', () => {
    renderNox();
    fireEvent.click(screen.getByRole('button', { name: 'View Demo' }));
    expect(screen.getByText('Demo mode active')).toBeInTheDocument();
    expect(screen.getByText('CREATE NIGHT')).toBeInTheDocument();
  });
});

// ── Event Filtering ───────────────────────────────
describe('Event Filtering', () => {
  it('shows all 5 events by default', () => {
    renderNox();
    expect(screen.getByText('NEON DISTRICT')).toBeInTheDocument();
    expect(screen.getByText('AFTERHOURS')).toBeInTheDocument();
    expect(screen.getByText('SKYLINE SIGNAL')).toBeInTheDocument();
    expect(screen.getByText('AMPLIFIED CITY')).toBeInTheDocument();
    expect(screen.getByText('ELECTRIC MONSOON')).toBeInTheDocument();
  });

  it('filters to only EDM events when EDM tag is clicked', () => {
    renderNox();
    fireEvent.click(screen.getByRole('button', { name: 'EDM' }));
    expect(screen.getByText('ELECTRIC MONSOON')).toBeInTheDocument();
    expect(screen.queryByText('NEON DISTRICT')).not.toBeInTheDocument();
    expect(screen.queryByText('AFTERHOURS')).not.toBeInTheDocument();
  });

  it('filters to only Techno events', () => {
    renderNox();
    fireEvent.click(screen.getByRole('button', { name: 'Techno' }));
    expect(screen.getByText('NEON DISTRICT')).toBeInTheDocument();
    expect(screen.queryByText('AFTERHOURS')).not.toBeInTheDocument();
  });

  it('"All" tag resets the filter', () => {
    renderNox();
    fireEvent.click(screen.getByRole('button', { name: 'EDM' }));
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText('NEON DISTRICT')).toBeInTheDocument();
    expect(screen.getByText('ELECTRIC MONSOON')).toBeInTheDocument();
  });
});

// ── Phone Tabs ────────────────────────────────────
describe('Phone Preview Tabs', () => {
  it('switches to Tickets tab and shows selected event ticket', () => {
    renderNox();
    // Click an event card to open ticket view
    const neonCard = screen.getByRole('button', { name: /NEON DISTRICT/i });
    fireEvent.click(neonCard);
    expect(screen.getByText('Selected Ticket')).toBeInTheDocument();
    // Event name appears in ticket view
    expect(screen.getAllByText('NEON DISTRICT').length).toBeGreaterThanOrEqual(1);
  });

  it('shows QR code placeholder in Tickets tab', () => {
    renderNox();
    fireEvent.click(screen.getByRole('button', { name: /AFTERHOURS/i }));
    expect(screen.getByText('Selected Ticket')).toBeInTheDocument();
    expect(screen.getByText('QR READY')).toBeInTheDocument();
  });

  it('switches to Profile tab via bottom nav', () => {
    renderNox();
    // Use bottom nav button within phone frame
    const phoneNav = screen.getByText('Profile');
    fireEvent.click(phoneNav);
    expect(screen.getByText('NIGHT ID')).toBeInTheDocument();
    expect(screen.getByText('Beta Insider')).toBeInTheDocument();
  });

  it('Create tab shows workflow steps', () => {
    renderNox();
    fireEvent.click(screen.getByText('Create')); // bottom nav
    expect(screen.getByText('CREATE NIGHT')).toBeInTheDocument();
    expect(screen.getByText('Draft event')).toBeInTheDocument();
    expect(screen.getByText('Scan entry')).toBeInTheDocument();
  });

  it('clicking a Create workflow step shows notice', () => {
    renderNox();
    fireEvent.click(screen.getByText('Create'));
    fireEvent.click(screen.getByText('Set capacity'));
    expect(screen.getByText('Workflow step selected')).toBeInTheDocument();
  });
});

// ── Platform Features Section ─────────────────────
describe('Platform Features', () => {
  it('renders all 4 feature cards', () => {
    renderNox();
    expect(screen.getByText('Event Discovery')).toBeInTheDocument();
    expect(screen.getByText('QR Ticketing')).toBeInTheDocument();
    expect(screen.getByText('Promoter OS')).toBeInTheDocument();
    expect(screen.getByText('Venue Intelligence')).toBeInTheDocument();
  });

  it('clicking a feature card shows notice', () => {
    renderNox();
    fireEvent.click(screen.getByText('Event Discovery'));
    expect(screen.getByText('Action Complete')).toBeInTheDocument();
  });
});

// ── Organizer Dashboard Section ──────────────────
describe('Organizer Dashboard', () => {
  it('renders the organizer section heading', () => {
    renderNox();
    expect(
      screen.getByRole('heading', { name: 'Infrastructure for promoters and venues.' }),
    ).toBeInTheDocument();
  });

  it('renders all 4 organizer feature buttons', () => {
    renderNox();
    expect(
      screen.getByRole('button', { name: 'Create and manage events in minutes' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Track live ticket sales and attendance' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Export guestlists and scan QR tickets' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Monitor analytics and customer behavior' }),
    ).toBeInTheDocument();
  });

  it('clicking an organizer feature shows a notice', () => {
    renderNox();
    fireEvent.click(screen.getByRole('button', { name: 'Create and manage events in minutes' }));
    expect(screen.getByText('Organizer action')).toBeInTheDocument();
  });
});

// ── Accessibility ─────────────────────────────────
describe('Accessibility', () => {
  it('notification close button has an accessible label', () => {
    renderNox();
    fireEvent.click(screen.getByRole('button', { name: 'Get App' }));
    expect(screen.getByRole('button', { name: /close notification/i })).toBeInTheDocument();
  });

  it('event images have alt text', () => {
    renderNox();
    const images = screen.getAllByRole('img');
    images.forEach((img) => {
      expect(img).toHaveAttribute('alt');
    });
  });
});
