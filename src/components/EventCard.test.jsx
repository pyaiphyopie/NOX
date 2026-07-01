import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import EventCard from './EventCard';

afterEach(() => cleanup());

const mockEvent = {
  id: '1',
  title: 'NEON DISTRICT',
  venue: 'Warehouse 19',
  genre: 'Techno / Underground',
  time: 'Tonight • 11:00 PM',
  price: 12,
  image: 'https://example.com/image.jpg',
};

function renderCard(event = mockEvent) {
  return render(
    <MemoryRouter>
      <EventCard event={event} />
    </MemoryRouter>,
  );
}

describe('EventCard', () => {
  it('renders the event title', () => {
    renderCard();
    expect(screen.getByText('NEON DISTRICT')).toBeInTheDocument();
  });

  it('renders the venue name', () => {
    renderCard();
    expect(screen.getByText('Warehouse 19')).toBeInTheDocument();
  });

  it('renders the price', () => {
    renderCard();
    expect(screen.getByText('$12')).toBeInTheDocument();
  });

  it('renders the genre', () => {
    renderCard();
    expect(screen.getByText('Techno / Underground')).toBeInTheDocument();
  });

  it('renders the time', () => {
    renderCard();
    expect(screen.getByText('Tonight • 11:00 PM')).toBeInTheDocument();
  });

  it('renders the event image with alt text', () => {
    renderCard();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'NEON DISTRICT');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('links to the correct event detail page', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/event/1');
  });

  it('renders the Secure Entry label', () => {
    renderCard();
    expect(screen.getByText('Secure Entry')).toBeInTheDocument();
  });
});
