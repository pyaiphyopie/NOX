import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import PromotersPage from './PromotersPage';

afterEach(() => cleanup());

describe('PromotersPage', () => {
  it('renders the organizer dashboard heading', () => {
    render(<PromotersPage />);
    expect(screen.getByText('Organizer Dashboard')).toBeInTheDocument();
  });

  it('renders the section title', () => {
    render(<PromotersPage />);
    expect(
      screen.getByRole('heading', { name: 'Infrastructure for promoters and venues.' }),
    ).toBeInTheDocument();
  });

  it('renders all promoter workflow steps', () => {
    render(<PromotersPage />);
    expect(screen.getByText('Draft event')).toBeInTheDocument();
    expect(screen.getByText('Set capacity')).toBeInTheDocument();
    expect(screen.getByText('Publish tickets')).toBeInTheDocument();
    expect(screen.getByText('Scan entry')).toBeInTheDocument();
  });

  it('renders workflow step descriptions', () => {
    render(<PromotersPage />);
    expect(
      screen.getByText('Create your event listing with details, lineup, and pricing.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Use the NOX Scanner to validate digital tickets at the door.'),
    ).toBeInTheDocument();
  });

  it('renders Promoter Console heading', () => {
    render(<PromotersPage />);
    expect(screen.getByText('Promoter Console')).toBeInTheDocument();
  });

  it('renders live analytics label', () => {
    render(<PromotersPage />);
    expect(screen.getByText('Live Event Analytics')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('renders dashboard metric values', () => {
    render(<PromotersPage />);
    expect(screen.getByText('1,248')).toBeInTheDocument();
    expect(screen.getByText('$18,900')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('1,034')).toBeInTheDocument();
  });

  it('renders dashboard metric labels', () => {
    render(<PromotersPage />);
    expect(screen.getByText('Tickets Sold')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Check-ins')).toBeInTheDocument();
  });

  it('renders predictive insight section', () => {
    render(<PromotersPage />);
    expect(screen.getByText('Predictive Insight')).toBeInTheDocument();
    expect(
      screen.getByText('Attendance demand trending +24% this weekend.'),
    ).toBeInTheDocument();
  });

  it('renders Create Event and View Analytics buttons', () => {
    render(<PromotersPage />);
    expect(screen.getByRole('button', { name: 'Create Event' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Analytics' })).toBeInTheDocument();
  });

  it('renders all 4 feature cards', () => {
    render(<PromotersPage />);
    expect(screen.getByText('Event Discovery')).toBeInTheDocument();
    expect(screen.getByText('QR Ticketing')).toBeInTheDocument();
    expect(screen.getByText('Promoter OS')).toBeInTheDocument();
    expect(screen.getByText('Venue Intelligence')).toBeInTheDocument();
  });

  it('renders the Platform Features label', () => {
    render(<PromotersPage />);
    expect(screen.getByText('Platform Features')).toBeInTheDocument();
  });
});
