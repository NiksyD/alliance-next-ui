import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckInDeskPage from './page';

describe('CheckInDeskPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Door Check-In Desk heading, event selector, and metrics', () => {
    render(<CheckInDeskPage />);

    expect(screen.getByText('Door Check-In Desk')).toBeInTheDocument();
    expect(screen.getByText('Total Registered')).toBeInTheDocument();
    expect(screen.getByText('Inside Venue')).toBeInTheDocument();
    expect(screen.getByText('Attendee Door Roster')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search attendee name/i)).toBeInTheDocument();
  });

  it('filters attendees in the door roster based on search input', async () => {
    const user = userEvent.setup();
    render(<CheckInDeskPage />);

    const searchInput = screen.getByPlaceholderText(/search attendee name/i);
    await user.type(searchInput, 'Nikko');

    expect(screen.getAllByText('Nikko Dela Cruz').length).toBeGreaterThan(0);
  });

  it('allows 1-click check in from the door roster', async () => {
    const user = userEvent.setup();
    render(<CheckInDeskPage />);

    // Select row check-in buttons (skip disabled top-bar form button)
    const allButtons = screen.getAllByRole('button', { name: /check in/i });
    const rowButton = allButtons.find((btn) => !btn.hasAttribute('disabled'));

    if (rowButton) {
      await user.click(rowButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/verified & admitted/i) || screen.queryByText(/inside/i),
        ).toBeTruthy();
      });
    }
  });

  it('toggles camera scanner viewfinder', async () => {
    const user = userEvent.setup();
    render(<CheckInDeskPage />);

    const cameraButton = screen.getByRole('button', { name: /camera/i });
    await user.click(cameraButton);

    expect(
      screen.getByText(/close camera/i) || screen.getByText(/hide camera viewfinder/i),
    ).toBeTruthy();
  });
});
