import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Notification from './Notification';

afterEach(() => cleanup());

describe('Notification', () => {
  it('renders nothing when notice is null', () => {
    const { container } = render(<Notification notice={null} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the notice title', () => {
    render(<Notification notice={{ title: 'Test Title', body: 'Test body' }} onClose={vi.fn()} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders the notice body', () => {
    render(<Notification notice={{ title: 'Title', body: 'Some body text' }} onClose={vi.fn()} />);
    expect(screen.getByText('Some body text')).toBeInTheDocument();
  });

  it('renders the Action Complete label', () => {
    render(<Notification notice={{ title: 'T', body: 'B' }} onClose={vi.fn()} />);
    expect(screen.getByText('Action Complete')).toBeInTheDocument();
  });

  it('renders a close button with accessible label', () => {
    render(<Notification notice={{ title: 'T', body: 'B' }} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: /close notification/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Notification notice={{ title: 'T', body: 'B' }} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close notification/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
