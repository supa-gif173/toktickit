import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StaffTicketDetail from '../../src/pages/StaffTicketDetail';
import * as api from '../../src/api';

vi.mock('../../src/api', async () => {
  const actual = await vi.importActual('../../src/api');
  return {
    ...actual,
    fetchStaffTicketDetails: vi.fn(),
    claimTicket: vi.fn(),
    assignTicket: vi.fn(),
    updateTicketPriority: vi.fn(),
    updateTicketStatus: vi.fn(),
  };
});

const mockStaffUser = {
  id: 'staff-1',
  name: 'Staff Member',
  email: 'staff@example.com',
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
  summary: 'Network Connectivity Issue',
  description: 'Cannot connect to the office internal network.',
  status: 'NEW',
  requestedPriority: 'HIGH',
  itPriority: 'HIGH',
  requesterId: 'req-1',
  categoryId: 'cat-1',
  systemId: 'sys-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  requester: { id: 'req-1', name: 'John Requester', email: 'john@example.com' },
  category: { id: 'cat-1', name: 'Network', isActive: true, createdAt: new Date().toISOString() },
  system: { id: 'sys-1', name: 'Intranet', isActive: true, createdAt: new Date().toISOString() },
  owner: null,
  attachments: [],
};

const renderComponent = (ticketData = mockTicketData) => {
  (api.fetchStaffTicketDetails as any).mockResolvedValue(ticketData);

  return render(
    <MemoryRouter initialEntries={['/staff/tickets/ticket-101']}>
      <Routes>
        <Route path="/staff/tickets/:id" element={<StaffTicketDetail />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('StaffTicketDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ticket details, operational fields, and Unassigned state', async () => {
    renderComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('INC-10001')).toBeInTheDocument();
      expect(screen.getByText('Network Connectivity Issue')).toBeInTheDocument();
      expect(screen.getByText('John Requester (john@example.com)')).toBeInTheDocument();
      expect(screen.getByText('Network')).toBeInTheDocument();
      expect(screen.getByText('Intranet')).toBeInTheDocument();
      expect(screen.getByText(/Cannot connect to the office internal network/)).toBeInTheDocument();
      expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });
  });

  it('claims ticket when Claim Ticket button is clicked', async () => {
    (api.claimTicket as any).mockResolvedValueOnce({
      ...mockTicketData,
      ownerId: mockStaffUser.id,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('INC-10001')).toBeInTheDocument();
    });

    const claimButton = screen.getByRole('button', { name: /claim ticket/i });
    expect(claimButton).toBeInTheDocument();
    fireEvent.click(claimButton);

    await waitFor(() => {
      expect(api.claimTicket).toHaveBeenCalledWith('ticket-101');
      expect(screen.getByText(/ticket claimed successfully/i)).toBeInTheDocument();
    });
  });

  it('updates IT priority when changed via dropdown', async () => {
    (api.updateTicketPriority as any).mockResolvedValueOnce({
      ...mockTicketData,
      itPriority: 'URGENT',
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('INC-10001')).toBeInTheDocument();
    });

    const prioritySelects = screen.getAllByRole('combobox');
    const prioritySelect = prioritySelects.find(s => (s as HTMLSelectElement).value === 'HIGH');
    expect(prioritySelect).toBeDefined();

    fireEvent.change(prioritySelect!, { target: { value: 'URGENT' } });

    await waitFor(() => {
      expect(api.updateTicketPriority).toHaveBeenCalledWith('ticket-101', 'URGENT');
    });
  });

  it('updates ticket status when a valid transition is selected', async () => {
    (api.updateTicketStatus as any).mockResolvedValueOnce({
      ...mockTicketData,
      status: 'OPEN',
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('INC-10001')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    const statusSelect = selects.find(s => (s as HTMLSelectElement).value === 'NEW');
    expect(statusSelect).toBeDefined();

    fireEvent.change(statusSelect!, { target: { value: 'OPEN' } });

    await waitFor(() => {
      expect(api.updateTicketStatus).toHaveBeenCalledWith('ticket-101', 'OPEN');
    });
  });
});
