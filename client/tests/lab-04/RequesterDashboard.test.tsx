import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RequesterDashboard from '../../src/pages/RequesterDashboard';
import * as api from '../../src/api';

vi.mock('../../src/api', async () => {
  const actual = await vi.importActual('../../src/api');
  return {
    ...actual,
    fetchRequesterDashboard: vi.fn(),
  };
});

const mockRequesterUser = {
  id: 'req-1',
  name: 'Somying Requester',
  email: 'somying@example.com',
  role: 'REQUESTER' as const,
  requiresPasswordChange: false,
};

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    activeUser: mockRequesterUser,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

const mockDashboardData: api.RequesterDashboardData = {
  metrics: {
    myOpenTickets: 3,
    waitingForRequester: 1,
    recentlyResolved: 5,
  },
  recentTickets: [
    {
      id: 'tkt-1',
      ticketNumber: 'TKT-2026-000001',
      summary: 'Printer network offline',
      status: 'OPEN',
      requestedPriority: 'HIGH',
      itPriority: 'HIGH',
      version: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tkt-2',
      ticketNumber: 'TKT-2026-000002',
      summary: 'VPN connection drop',
      status: 'WAITING_FOR_REQUESTER',
      requestedPriority: 'MEDIUM',
      itPriority: 'MEDIUM',
      version: 2,
      updatedAt: new Date().toISOString(),
    },
  ],
};

describe('Requester Dashboard Component (Sprint 4 - Issue 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('UI-01: renders personal metrics, greeting, quick actions, and recent tickets table (FR-07, AC-10)', async () => {
    vi.mocked(api.fetchRequesterDashboard).mockResolvedValue(mockDashboardData);

    render(
      <MemoryRouter>
        <RequesterDashboard />
      </MemoryRouter>
    );

    // Initial loading state
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();

    // After data loads
    await waitFor(() => {
      expect(screen.getByTestId('requester-dashboard')).toBeInTheDocument();
    });

    // Greeting
    expect(screen.getByText(/Welcome back, Somying Requester!/i)).toBeInTheDocument();
    expect(screen.getByText(/Here's what's happening with your requests/i)).toBeInTheDocument();

    // Metric cards
    expect(screen.getByTestId('card-open-tickets')).toHaveTextContent('3');
    expect(screen.getByTestId('card-waiting-tickets')).toHaveTextContent('1');
    expect(screen.getByTestId('card-resolved-tickets')).toHaveTextContent('5');

    // Quick Action buttons
    expect(screen.getByTestId('btn-create-ticket')).toBeInTheDocument();
    expect(screen.getByTestId('btn-view-tickets')).toBeInTheDocument();

    // Recent tickets
    expect(screen.getByTestId('recent-tickets-table')).toBeInTheDocument();
    expect(screen.getByText('TKT-2026-000001')).toBeInTheDocument();
    expect(screen.getByText('Printer network offline')).toBeInTheDocument();
    expect(screen.getByText('TKT-2026-000002')).toBeInTheDocument();
    expect(screen.getByText('VPN connection drop')).toBeInTheDocument();
  });

  it('UI-01 (Empty & Error States): handles empty ticket list and error retry gracefully', async () => {
    // 1. Error state
    vi.mocked(api.fetchRequesterDashboard).mockRejectedValueOnce(new Error('Network error'));

    const { unmount } = render(
      <MemoryRouter>
        <RequesterDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
    });
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();

    unmount();

    // 2. Empty state
    vi.mocked(api.fetchRequesterDashboard).mockResolvedValueOnce({
      metrics: { myOpenTickets: 0, waitingForRequester: 0, recentlyResolved: 0 },
      recentTickets: [],
    });

    render(
      <MemoryRouter>
        <RequesterDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('empty-recent-tickets')).toBeInTheDocument();
    });
    expect(screen.getByText(/No tickets yet. Need help\? Create your first ticket./i)).toBeInTheDocument();
  });
});
