import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import ActionsTaken from '../../src/components/ActionsTaken';
import * as api from '../../src/api';

vi.mock('../../src/api', async () => {
  const actual = await vi.importActual('../../src/api');
  return {
    ...actual,
    fetchTicketActions: vi.fn(),
    createTicketAction: vi.fn(),
    updateTicketAction: vi.fn(),
    fetchStaffAssignees: vi.fn(),
  };
});

const mockStaffUser = {
  id: 'staff-user-1',
  name: 'Somchai Prasert',
  email: 'somchai@toktickit.com',
  role: 'STAFF' as const,
  requiresPasswordChange: false,
};

let currentMockUser: any = mockStaffUser;

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    activeUser: currentMockUser,
    setActiveUser: vi.fn(),
    isLoading: false,
    logout: vi.fn(),
  }),
}));

const mockAssignees: api.User[] = [
  {
    id: 'staff-user-1',
    name: 'Somchai Prasert',
    email: 'somchai@toktickit.com',
    role: 'STAFF',
    requiresPasswordChange: false,
    isActive: true,
  },
  {
    id: 'staff-user-2',
    name: 'Manee Jai-dee',
    email: 'manee@toktickit.com',
    role: 'STAFF',
    requiresPasswordChange: false,
    isActive: true,
  },
  {
    id: 'inactive-staff',
    name: 'Inactive Staff',
    email: 'inactive@toktickit.com',
    role: 'STAFF',
    requiresPasswordChange: false,
    isActive: false,
  },
];

const mockActions: api.ActionTaken[] = [
  {
    id: 'act-1',
    ticketId: 'ticket-101',
    performedById: 'staff-user-1',
    assigneeId: 'staff-user-1',
    status: 'IN_PROGRESS',
    actionDateTime: '2026-10-31T09:00:00.000Z',
    description: 'Diagnosed router ARP cache and inspected core switch logs.',
    result: 'Identified packet drops at port 24',
    followUpRequired: true,
    followUpNote: 'Replace patch cable on port 24 if drops persist',
    attachmentNotes: 'router-log.txt',
    version: 1,
    createdAt: '2026-10-31T09:00:00.000Z',
    updatedAt: '2026-10-31T09:00:00.000Z',
    performedBy: { id: 'staff-user-1', name: 'Somchai Prasert', email: 'somchai@toktickit.com', role: 'STAFF' },
    assignee: { id: 'staff-user-1', name: 'Somchai Prasert', email: 'somchai@toktickit.com', role: 'STAFF', isActive: true },
  },
  {
    id: 'act-2',
    ticketId: 'ticket-101',
    performedById: 'staff-user-1',
    assigneeId: 'staff-user-2',
    status: 'COMPLETED',
    actionDateTime: '2026-10-31T10:00:00.000Z',
    description: 'Replaced patch cable and verified line stabilization.',
    result: 'Zero CRC errors detected over 30-minute soak test',
    followUpRequired: false,
    followUpNote: null,
    attachmentNotes: null,
    version: 2,
    createdAt: '2026-10-31T10:00:00.000Z',
    updatedAt: '2026-10-31T10:30:00.000Z',
    performedBy: { id: 'staff-user-1', name: 'Somchai Prasert', email: 'somchai@toktickit.com', role: 'STAFF' },
    assignee: { id: 'staff-user-2', name: 'Manee Jai-dee', email: 'manee@toktickit.com', role: 'STAFF', isActive: true },
  },
  {
    id: 'act-3',
    ticketId: 'ticket-101',
    performedById: 'staff-user-1',
    assigneeId: 'inactive-staff',
    status: 'CANCELLED',
    actionDateTime: '2026-10-31T10:45:00.000Z',
    description: 'Scheduled redundant switch reboot.',
    result: 'Not required after port stabilization',
    followUpRequired: false,
    followUpNote: null,
    attachmentNotes: null,
    version: 1,
    createdAt: '2026-10-31T10:45:00.000Z',
    updatedAt: '2026-10-31T10:45:00.000Z',
    performedBy: { id: 'staff-user-1', name: 'Somchai Prasert', email: 'somchai@toktickit.com', role: 'STAFF' },
    assignee: { id: 'inactive-staff', name: 'Inactive Staff', email: 'inactive@toktickit.com', role: 'STAFF', isActive: false },
  },
];

describe('ActionsTaken Component (Lab 4 Sprint 4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockUser = mockStaffUser;
    (api.fetchTicketActions as any).mockResolvedValue([...mockActions]);
    (api.fetchStaffAssignees as any).mockResolvedValue([...mockAssignees]);
  });

  // UI-03: Renders Actions Taken list and opens create modal on button click
  it('UI-03: renders Actions Taken table, status badges, and opens create modal on "+ Add Action" click', async () => {
    render(<ActionsTaken ticketId="ticket-101" isStaffOrAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /actions taken/i })).toBeInTheDocument();
      expect(screen.getByTestId('actions-count-badge')).toHaveTextContent('3');
      const table = screen.getByTestId('actions-table');
      expect(within(table).getByText('Diagnosed router ARP cache and inspected core switch logs.')).toBeInTheDocument();
      expect(within(table).getByText('Replaced patch cable and verified line stabilization.')).toBeInTheDocument();
    });

    // Check status badges
    expect(screen.getAllByTestId('status-badge-in-progress').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('status-badge-completed').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('status-badge-cancelled').length).toBeGreaterThan(0);

    // Click "+ Add Action" button
    const addBtn = screen.getByTestId('add-action-btn');
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);

    // Verify modal is open
    expect(screen.getByTestId('create-action-modal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /add action taken/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/action description/i)).toBeInTheDocument();
  });

  // UI-04: Actions Taken form validation
  it('UI-04: enforces validation: requires description, result on COMPLETED, and follow-up note when checked', async () => {
    render(<ActionsTaken ticketId="ticket-101" isStaffOrAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('add-action-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('add-action-btn'));

    const submitBtn = screen.getByTestId('submit-create-action-btn');

    // 1. Submit empty form -> requires description
    fireEvent.click(submitBtn);
    expect(screen.getByTestId('create-form-error')).toHaveTextContent(/description is required/i);
    expect(api.createTicketAction).not.toHaveBeenCalled();

    // 2. Fill description, set status to COMPLETED with empty result
    fireEvent.change(screen.getByLabelText(/action description/i), {
      target: { value: 'Firmware upgraded on core switch' },
    });
    fireEvent.change(screen.getByLabelText(/^status/i), {
      target: { value: 'COMPLETED' },
    });
    fireEvent.click(submitBtn);
    expect(screen.getByTestId('create-form-error')).toHaveTextContent(/result is required when action is marked as completed/i);
    expect(api.createTicketAction).not.toHaveBeenCalled();

    // 3. Fill result, but check Follow-Up Required without note
    fireEvent.change(screen.getByLabelText(/result \/ outcome/i), {
      target: { value: 'Upgrade successful without downtime' },
    });
    fireEvent.click(screen.getByLabelText(/follow-up required/i));

    // Conditional textarea should now appear
    expect(screen.getByTestId('create-followup-note-field')).toBeInTheDocument();

    fireEvent.click(submitBtn);
    expect(screen.getByTestId('create-form-error')).toHaveTextContent(/follow-up note is required when follow-up is requested/i);
    expect(api.createTicketAction).not.toHaveBeenCalled();

    // 4. Fill follow-up note and submit successfully
    fireEvent.change(screen.getByLabelText(/follow-up note/i), {
      target: { value: 'Check port error counters after 24 hours' },
    });

    (api.createTicketAction as any).mockResolvedValueOnce({
      id: 'act-new',
      ticketId: 'ticket-101',
      description: 'Firmware upgraded on core switch',
      status: 'COMPLETED',
      result: 'Upgrade successful without downtime',
      followUpRequired: true,
      followUpNote: 'Check port error counters after 24 hours',
      version: 1,
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createTicketAction).toHaveBeenCalledWith('ticket-101', expect.objectContaining({
        description: 'Firmware upgraded on core switch',
        status: 'COMPLETED',
        result: 'Upgrade successful without downtime',
        followUpRequired: true,
        followUpNote: 'Check port error counters after 24 hours',
      }));
    });
  });

  // UI-05: Actions Taken view under Requester session
  it('UI-05: renders actions in read-only presentation for Requesters and hides "+ Add Action" button', async () => {
    currentMockUser = {
      id: 'req-user-1',
      name: 'John Requester',
      email: 'john@example.com',
      role: 'REQUESTER' as const,
      requiresPasswordChange: false,
    };

    render(<ActionsTaken ticketId="ticket-101" isStaffOrAdmin={false} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /actions taken/i })).toBeInTheDocument();
      const table = screen.getByTestId('actions-table');
      expect(within(table).getByText('Diagnosed router ARP cache and inspected core switch logs.')).toBeInTheDocument();
    });

    // Add Action button must NOT exist for requesters
    expect(screen.queryByTestId('add-action-btn')).not.toBeInTheDocument();
    // Edit buttons must NOT exist for requesters
    expect(screen.queryByTestId('edit-action-btn-act-1')).not.toBeInTheDocument();
  });

  // UI-09: Terminal lock UI on completed/cancelled actions
  it('UI-09: displays locked badge for completed and cancelled actions and disables/prevents editing', async () => {
    render(<ActionsTaken ticketId="ticket-101" isStaffOrAdmin={true} />);

    await waitFor(() => {
      const table = screen.getByTestId('actions-table');
      expect(within(table).getByText('Diagnosed router ARP cache and inspected core switch logs.')).toBeInTheDocument();
    });

    // act-1 is IN_PROGRESS: Edit button must be present
    expect(screen.getByTestId('edit-action-btn-act-1')).toBeInTheDocument();

    // act-2 (COMPLETED) and act-3 (CANCELLED): Must show [Locked] badge and no Edit button
    expect(screen.queryByTestId('edit-action-btn-act-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('edit-action-btn-act-3')).not.toBeInTheDocument();

    const lockedBadges = screen.getAllByTestId('terminal-locked-badge');
    expect(lockedBadges.length).toBe(2);
    expect(lockedBadges[0]).toHaveTextContent(/\[Locked\]/i);

    // Inactive assignee on cancelled action displays [Inactive] pill
    expect(screen.getAllByTestId('inactive-assignee-pill').length).toBeGreaterThan(0);
  });
});
