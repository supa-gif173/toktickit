import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StaffTicketDetail from '../../src/pages/StaffTicketDetail';
import TicketDetail from '../../src/pages/TicketDetail';
import * as api from '../../src/api';

vi.mock('../../src/api', async () => {
  const actual = await vi.importActual('../../src/api');
  return {
    ...actual,
    fetchStaffTicketDetails: vi.fn(),
    fetchTicketDetails: vi.fn(),
    updateTicketStatus: vi.fn(),
    updateTicketResolutionIndicator: vi.fn(),
    fetchTicketActions: vi.fn().mockResolvedValue([]),
    fetchTicketHistory: vi.fn().mockResolvedValue([]),
    fetchStaffAssignees: vi.fn().mockResolvedValue([]),
  };
});

const mockStaffUser = {
  id: 'staff-1',
  name: 'Somchai Prasert',
  email: 'somchai@toktickit.com',
  role: 'STAFF' as const,
  requiresPasswordChange: false,
};

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    activeUser: mockStaffUser,
    setActiveUser: vi.fn(),
    isLoading: false,
    logout: vi.fn(),
  }),
}));

const mockTicketData: api.Ticket = {
  id: 'ticket-101',
  ticketNumber: 'INC-10001',
  summary: 'Network Performance Degradation',
  description: 'Slow network access reported across the floor.',
  status: 'IN_PROGRESS',
  requestedPriority: 'HIGH',
  itPriority: 'HIGH',
  requesterId: 'req-1',
  categoryId: 'cat-1',
  systemId: 'sys-1',
  ownerId: 'staff-1',
  version: 2,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  requester: { id: 'req-1', name: 'John Requester', email: 'john@example.com' },
  owner: mockStaffUser,
  problemAppearsResolved: false,
  attachments: [],
  actionsTaken: [
    {
      id: 'act-1',
      ticketId: 'ticket-101',
      performedById: 'staff-1',
      status: 'COMPLETED',
      actionDateTime: new Date().toISOString(),
      description: 'Reconfigured switch queue buffers',
      result: 'Throughput restored to nominal Gigabit levels',
      followUpRequired: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

describe('Ticket Workflow & Resolution Gate Component Tests (Sprint 4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchTicketActions as any).mockResolvedValue(mockTicketData.actionsTaken || []);
    (api.fetchTicketHistory as any).mockResolvedValue([]);
    (api.fetchStaffAssignees as any).mockResolvedValue([mockStaffUser]);
  });

  // UI-06: Ticket Workflow status transition dropdown & Resolution Gate checklist
  it('UI-06: displays permitted status transitions and Resolution Gate checklist prerequisites', async () => {
    (api.fetchStaffTicketDetails as any).mockResolvedValue(mockTicketData);

    render(
      <MemoryRouter initialEntries={['/staff/tickets/ticket-101']}>
        <Routes>
          <Route path="/staff/tickets/:id" element={<StaffTicketDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Network Performance Degradation')).toBeInTheDocument();
      expect(screen.getByTestId('resolution-gate-checklist')).toBeInTheDocument();
    });

    // Check Resolution Gate checklist items
    const checklist = screen.getByTestId('resolution-gate-checklist');
    expect(checklist).toHaveTextContent(/owner assigned/i);
    expect(checklist).toHaveTextContent(/completed action with result/i);
    expect(checklist).toHaveTextContent(/follow-up notes satisfied/i);

    // Verify status dropdown contains valid transitions from IN_PROGRESS
    const statusSelect = screen.getByDisplayValue(/in progress/i);
    expect(statusSelect).toBeInTheDocument();

    // Trigger status transition
    (api.updateTicketStatus as any).mockResolvedValueOnce({
      ...mockTicketData,
      status: 'RESOLVED',
      version: 3,
    });

    fireEvent.change(statusSelect, { target: { value: 'RESOLVED' } });

    await waitFor(() => {
      expect(api.updateTicketStatus).toHaveBeenCalledWith('ticket-101', 'RESOLVED', 2);
    });
  });

  // UI-07: Requester Resolution indicator toggle
  it('UI-07: renders Requester resolution toggle and triggers API call on user interaction', async () => {
    (api.fetchTicketDetails as any).mockResolvedValue(mockTicketData);
    (api.updateTicketResolutionIndicator as any).mockResolvedValue({ problemAppearsResolved: true });

    render(
      <MemoryRouter initialEntries={['/tickets/ticket-101']}>
        <Routes>
          <Route path="/tickets/:id" element={<TicketDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('requester-resolution-card')).toBeInTheDocument();
      expect(screen.getByText(/did this resolve your problem\?/i)).toBeInTheDocument();
    });

    const toggle = screen.getByTestId('requester-resolve-toggle') as HTMLInputElement;
    expect(toggle.checked).toBe(false);

    // Click toggle to mark resolved
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(api.updateTicketResolutionIndicator).toHaveBeenCalledWith('ticket-101', true);
      expect(screen.getByTestId('advisory-success-msg')).toHaveTextContent(/problem resolution indicator updated/i);
    });
  });
});
