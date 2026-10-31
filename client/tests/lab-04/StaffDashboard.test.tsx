import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StaffDashboard from '../../src/pages/StaffDashboard';
import * as api from '../../src/api';

vi.mock('../../src/api', async () => {
  const actual = await vi.importActual('../../src/api');
  return {
    ...actual,
    fetchStaffDashboard: vi.fn(),
  };
});

let mockActiveUser = {
  id: 'staff-1',
  name: 'Somchai Staff',
  email: 'somchai@toktickit.com',
  role: 'STAFF' as 'STAFF' | 'ADMIN' | 'REQUESTER',
  requiresPasswordChange: false,
};

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    activeUser: mockActiveUser,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

const mockStaffData: api.StaffDashboardData = {
  metrics: {
    newTickets: 14,
    openTickets: 23,
    inProgressTickets: 18,
    waitingForRequester: 7,
    myAssignedTickets: 16,
    unassignedTickets: 8,
  },
  ticketsByPriority: {
    URGENT: 4,
    HIGH: 12,
    MEDIUM: 25,
    LOW: 37,
  },
  recentQueueTickets: [
    {
      id: 'tkt-101',
      ticketNumber: 'TKT-2026-000101',
      summary: 'Database connection pool exhausted',
      status: 'IN_PROGRESS',
      itPriority: 'URGENT',
      version: 3,
      owner: { id: 'staff-1', name: 'Somchai Staff' },
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tkt-102',
      ticketNumber: 'TKT-2026-000102',
      summary: 'Monitor resolution issue on docking station',
      status: 'OPEN',
      itPriority: 'LOW',
      version: 1,
      owner: undefined,
      updatedAt: new Date().toISOString(),
    },
  ],
  adminStats: {
    totalUsers: 45,
    activeStaff: 8,
    activeRequesters: 37,
  },
};

describe('IT Staff & Admin Dashboard Component (Sprint 4 - Issue 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveUser = {
      id: 'staff-1',
      name: 'Somchai Staff',
      email: 'somchai@toktickit.com',
      role: 'STAFF',
      requiresPasswordChange: false,
    };
  });

  it('UI-02: renders operational metrics ribbon, priority breakdown, and recent queue activity (FR-08, AC-11)', async () => {
    vi.mocked(api.fetchStaffDashboard).mockResolvedValue(mockStaffData);

    render(
      <MemoryRouter>
        <StaffDashboard />
      </MemoryRouter>
    );

    // Initial loading state
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();

    // After data loads
    await waitFor(() => {
      expect(screen.getByTestId('staff-dashboard')).toBeInTheDocument();
    });

    // Greeting & Subtitle
    expect(screen.getByText(/Welcome back, Somchai Staff!/i)).toBeInTheDocument();
    expect(screen.getByText(/Operational overview of the IT Service Desk/i)).toBeInTheDocument();

    // Ribbon Metric Cards
    expect(screen.getByTestId('card-new-tickets')).toHaveTextContent('14');
    expect(screen.getByTestId('card-open-tickets')).toHaveTextContent('23');
    expect(screen.getByTestId('card-in-progress-tickets')).toHaveTextContent('18');
    expect(screen.getByTestId('card-waiting-tickets')).toHaveTextContent('7');
    expect(screen.getByTestId('card-my-assigned-tickets')).toHaveTextContent('16');
    expect(screen.getByTestId('card-unassigned-tickets')).toHaveTextContent('8');

    // Priority Breakdown
    expect(screen.getByTestId('priority-breakdown-card')).toBeInTheDocument();
    expect(screen.getByTestId('priority-urgent')).toHaveTextContent('4');
    expect(screen.getByTestId('priority-high')).toHaveTextContent('12');
    expect(screen.getByTestId('priority-medium')).toHaveTextContent('25');
    expect(screen.getByTestId('priority-low')).toHaveTextContent('37');

    // Quick Actions
    expect(screen.getByTestId('btn-search-queue')).toBeInTheDocument();
    expect(screen.getByTestId('btn-my-queue')).toBeInTheDocument();

    // Recent Queue Activity
    expect(screen.getByTestId('recent-queue-card')).toBeInTheDocument();
    expect(screen.getByText('TKT-2026-000101')).toBeInTheDocument();
    expect(screen.getByText('Database connection pool exhausted')).toBeInTheDocument();
    expect(screen.getByText('TKT-2026-000102')).toBeInTheDocument();
    expect(within(screen.getByTestId('recent-queue-card')).getByText('Unassigned')).toBeInTheDocument();

    // Since mockActiveUser.role === 'STAFF', admin stats card should not be displayed
    expect(screen.queryByTestId('admin-stats-card')).not.toBeInTheDocument();
  });

  it('UI-02 (Admin Role): renders Administrator overview stats when user is ADMIN (BR-10)', async () => {
    mockActiveUser = {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@toktickit.com',
      role: 'ADMIN',
      requiresPasswordChange: false,
    };

    vi.mocked(api.fetchStaffDashboard).mockResolvedValue(mockStaffData);

    render(
      <MemoryRouter>
        <StaffDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('staff-dashboard')).toBeInTheDocument();
    });

    // Admin overview card should be present
    expect(screen.getByTestId('admin-stats-card')).toBeInTheDocument();
    expect(screen.getByTestId('admin-total-users')).toHaveTextContent('45');
    expect(screen.getByTestId('admin-active-staff')).toHaveTextContent('8');
    expect(screen.getByTestId('admin-active-requesters')).toHaveTextContent('37');
  });
});
