import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TicketHistory from '../../src/components/TicketHistory';
import * as api from '../../src/api';

vi.mock('../../src/api', async () => {
  const actual = await vi.importActual('../../src/api');
  return {
    ...actual,
    fetchTicketHistory: vi.fn(),
  };
});

const mockHistoryData: api.StatusHistoryEntry[] = [
  {
    id: 'hist-1',
    ticketId: 'ticket-101',
    fromStatus: 'NEW',
    toStatus: 'IN_PROGRESS',
    changedById: 'staff-1',
    changedAt: '2026-10-31T08:30:00.000Z',
    changedBy: {
      id: 'staff-1',
      name: 'Somchai Prasert',
      email: 'somchai@toktickit.com',
      role: 'STAFF',
    },
  },
  {
    id: 'hist-2',
    ticketId: 'ticket-101',
    fromStatus: 'IN_PROGRESS',
    toStatus: 'RESOLVED',
    changedById: 'staff-1',
    changedAt: '2026-10-31T09:45:00.000Z',
    changedBy: {
      id: 'staff-1',
      name: 'Somchai Prasert',
      email: 'somchai@toktickit.com',
      role: 'STAFF',
    },
  },
];

describe('TicketHistory Component (Sprint 4 - UI-10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('UI-10: chronologically renders status audit history entries with status chips, actor, and timestamps', async () => {
    (api.fetchTicketHistory as any).mockResolvedValue([...mockHistoryData]);

    render(<TicketHistory ticketId="ticket-101" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /status audit history/i })).toBeInTheDocument();
      expect(screen.getByTestId('history-timeline')).toBeInTheDocument();
    });

    // Check entry 1
    const entry1 = screen.getByTestId('history-entry-hist-1');
    expect(entry1).toHaveTextContent(/new/i);
    expect(entry1).toHaveTextContent(/in progress/i);
    expect(entry1).toHaveTextContent(/somchai prasert/i);
    expect(entry1).toHaveTextContent(/staff/i);

    // Check entry 2
    const entry2 = screen.getByTestId('history-entry-hist-2');
    expect(entry2).toHaveTextContent(/in progress/i);
    expect(entry2).toHaveTextContent(/resolved/i);
  });

  it('renders friendly empty state when no status history exists', async () => {
    (api.fetchTicketHistory as any).mockResolvedValue([]);

    render(<TicketHistory ticketId="ticket-101" />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-history-msg')).toHaveTextContent(/no status transitions recorded yet/i);
    });
  });
});
