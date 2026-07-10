import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import TicketsPage from './TicketsPage';

afterEach(() => cleanup());

describe('TicketsPage', () => {
  it('renders the page heading', () => {
    render(<TicketsPage />);
    expect(screen.getByText('Digital Entry')).toBeInTheDocument();
  });

  it('renders the QR tagline', () => {
    render(<TicketsPage />);
    expect(
      screen.getByRole('heading', { name: /QR-powered tickets/i }),
    ).toBeInTheDocument();
  });

  it('renders all event selection buttons', () => {
    render(<TicketsPage />);
    expect(screen.getAllByText('NEON DISTRICT').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('AFTERHOURS')).toBeInTheDocument();
    expect(screen.getByText('SKYLINE SIGNAL')).toBeInTheDocument();
    expect(screen.getByText('AMPLIFIED CITY')).toBeInTheDocument();
    expect(screen.getByText('ELECTRIC MONSOON')).toBeInTheDocument();
  });

  it('shows the first event selected by default in the ticket preview', () => {
    render(<TicketsPage />);
    expect(screen.getByText('Digital Ticket')).toBeInTheDocument();
    expect(screen.getByText('QR Entry Pass')).toBeInTheDocument();
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('renders the default ticket ID', () => {
    render(<TicketsPage />);
    expect(screen.getByText('NOX-000001')).toBeInTheDocument();
  });

  it('switches ticket preview when another event is clicked', () => {
    render(<TicketsPage />);
    const afterhoursButton = screen.getAllByText('AFTERHOURS')[0].closest('button');
    fireEvent.click(afterhoursButton);
    expect(screen.getByText('NOX-000002')).toBeInTheDocument();
  });

  it('renders ticket detail fields', () => {
    render(<TicketsPage />);
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Genre')).toBeInTheDocument();
    expect(screen.getByText('Ticket ID')).toBeInTheDocument();
    expect(screen.getByText('General Admission')).toBeInTheDocument();
  });

  it('renders Add to Wallet and Share Ticket buttons', () => {
    render(<TicketsPage />);
    expect(screen.getByRole('button', { name: 'Add to Wallet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share Ticket' })).toBeInTheDocument();
  });

  it('renders QR code grid', () => {
    const { container } = render(<TicketsPage />);
    const qrGrid = container.querySelector('.grid.grid-cols-8');
    expect(qrGrid).toBeInTheDocument();
    expect(qrGrid.children.length).toBe(64);
  });

  it('renders the event selector helper text', () => {
    render(<TicketsPage />);
    expect(screen.getByText('Select an event to preview your ticket')).toBeInTheDocument();
  });
});
