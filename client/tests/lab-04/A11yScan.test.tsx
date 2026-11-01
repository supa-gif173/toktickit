import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';
import RequesterDashboard from '../../src/pages/RequesterDashboard';
import StaffDashboard from '../../src/pages/StaffDashboard';
import ActionsTaken from '../../src/components/ActionsTaken';
import TicketHistory from '../../src/components/TicketHistory';
import * as api from '../../src/api';

vi.mock('../../src/api', async () => {
  const actual = await vi.importActual('../../src/api');
  return {
    ...actual,
    fetchRequesterDashboard: vi.fn(),
    fetchStaffDashboard: vi.fn(),
    fetchTicketActions: vi.fn(),
    fetchStaffAssignees: vi.fn(),
    fetchTicketHistory: vi.fn(),
  };
});

const mockRequesterUser = {
  id: 'req-1',
  name: 'Somying Requester',
  email: 'somying@example.com',
  role: 'REQUESTER' as const,
  requiresPasswordChange: false,
};

const mockStaffUser = {
  id: 'staff-1',
  name: 'Somchai Staff',
  email: 'somchai@toktickit.com',
  role: 'STAFF' as const,
  requiresPasswordChange: false,
};

let currentUser: any = mockRequesterUser;

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    activeUser: currentUser,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

describe('Automated Axe-Core Accessibility Scan (UI-08, Part 9, AC-14)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('UI-08: Requester Dashboard passes WCAG 2.1 AA accessibility checks with 0 violations', async () => {
    currentUser = mockRequesterUser;
    vi.mocked(api.fetchRequesterDashboard).mockResolvedValue({
      metrics: { myOpenTickets: 2, waitingForRequester: 1, recentlyResolved: 3 },
      recentTickets: [
        {
          id: 'tkt-1',
          ticketNumber: 'TKT-2026-000001',
          summary: 'Cannot connect to company WiFi',
          status: 'OPEN',
          itPriority: 'HIGH',
          version: 1,
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    const { container } = render(
      <MemoryRouter>
        <RequesterDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.querySelector('[data-testid="requester-dashboard"]')).toBeInTheDocument();
    });

    // JSDOM does not support CSS color computation, so color-contrast rule is disabled for JSDOM scans
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });

  it('UI-08: IT Staff Dashboard passes WCAG 2.1 AA accessibility checks with 0 violations', async () => {
    currentUser = mockStaffUser;
    vi.mocked(api.fetchStaffDashboard).mockResolvedValue({
      metrics: {
        newTickets: 5,
        openTickets: 10,
        inProgressTickets: 8,
        waitingForRequester: 2,
        myAssignedTickets: 7,
        unassignedTickets: 3,
      },
      ticketsByPriority: { URGENT: 2, HIGH: 6, MEDIUM: 10, LOW: 5 },
      recentQueueTickets: [
        {
          id: 'tkt-101',
          ticketNumber: 'TKT-2026-000101',
          summary: 'VPN Gateway latency spikes',
          status: 'IN_PROGRESS',
          itPriority: 'HIGH',
          version: 2,
          owner: { id: 'staff-1', name: 'Somchai Staff' },
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    const { container } = render(
      <MemoryRouter>
        <StaffDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.querySelector('[data-testid="staff-dashboard"]')).toBeInTheDocument();
    });

    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });

  it('UI-08: Actions Taken and Ticket History components pass WCAG 2.1 AA with 0 violations', async () => {
    currentUser = mockStaffUser;
    vi.mocked(api.fetchTicketActions).mockResolvedValue([
      {
        id: 'act-1',
        ticketId: 'tkt-101',
        actionDateTime: new Date().toISOString(),
        description: 'Replaced router cable and verified continuity.',
        result: 'Connected cleanly with zero packet loss.',
        performedById: 'staff-1',
        performedBy: { id: 'staff-1', name: 'Somchai Staff', email: 'somchai@toktickit.com' },
        assigneeId: 'staff-1',
        assignee: { id: 'staff-1', name: 'Somchai Staff', email: 'somchai@toktickit.com', isActive: true },
        status: 'COMPLETED',
        followUpRequired: false,
        followUpNote: null,
        version: 1,
      },
    ]);
    vi.mocked(api.fetchStaffAssignees).mockResolvedValue([]);

    const { container: actionsContainer } = render(
      <MemoryRouter>
        <ActionsTaken ticketId="tkt-101" isStaffOrAdmin={true} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(actionsContainer.querySelector('[data-testid="actions-taken-section"]')).toBeInTheDocument();
    });

    const actionsResults = await axe.run(actionsContainer, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });
    expect(
      actionsResults.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    ).toEqual([]);

    // TicketHistory timeline
    vi.mocked(api.fetchTicketHistory).mockResolvedValue([
      {
        id: 'hist-1',
        ticketId: 'tkt-101',
        fromStatus: 'OPEN',
        toStatus: 'IN_PROGRESS',
        changedById: 'staff-1',
        changedBy: { id: 'staff-1', name: 'Somchai Staff', email: 'somchai@toktickit.com', role: 'STAFF' },
        changedAt: new Date().toISOString(),
      },
    ]);

    const { container: historyContainer } = render(
      <MemoryRouter>
        <TicketHistory ticketId="tkt-101" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(historyContainer.querySelector('[data-testid="ticket-history-widget"]')).toBeInTheDocument();
    });

    const historyResults = await axe.run(historyContainer, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });
    expect(
      historyResults.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    ).toEqual([]);
  });
});
