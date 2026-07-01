import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

afterEach(() => cleanup());

function renderNavbar(props = {}) {
  const onGetApp = props.onGetApp || vi.fn();
  return {
    onGetApp,
    ...render(
      <MemoryRouter initialEntries={[props.route || '/']}>
        <Navbar onGetApp={onGetApp} />
      </MemoryRouter>,
    ),
  };
}

describe('Navbar', () => {
  it('renders the NOX brand heading', () => {
    renderNavbar();
    expect(screen.getByRole('heading', { name: 'NOX' })).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    renderNavbar();
    expect(screen.getByText('Own The Night')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: 'Discover' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Venues' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Promoters' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tickets' })).toBeInTheDocument();
  });

  it('highlights the active nav link for the current route', () => {
    renderNavbar({ route: '/venues' });
    const venuesLink = screen.getByRole('link', { name: 'Venues' });
    expect(venuesLink.className).toContain('text-cyan-400');
  });

  it('renders the Get App button', () => {
    renderNavbar();
    expect(screen.getByRole('button', { name: 'Get App' })).toBeInTheDocument();
  });

  it('calls onGetApp when Get App button is clicked', () => {
    const { onGetApp } = renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: 'Get App' }));
    expect(onGetApp).toHaveBeenCalledTimes(1);
  });

  it('brand links to the home page', () => {
    renderNavbar();
    const brandLink = screen.getAllByRole('link').find((link) => link.getAttribute('href') === '/');
    expect(brandLink).toBeDefined();
  });
});
