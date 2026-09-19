import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StaffTicketQueue from '../../src/pages/StaffTicketQueue';
import * as api from '../../src/api';

vi.mock('../../src/api', async () => {
  const actual = await vi.importActual('../../src/api');
  return {
    ...actual,
    fetchStaffTickets: vi.fn(),
  };
});

const mockTickets = [
  {
    id: 't1',
    ticketNumber: 'INC-10001',
    summary: 'Email not working',
    description: 'Cannot send or receive emails.',
    status: 'NEW',
    itPriority: 'HIGH',
    requestedPriority: 'HIGH',
    requesterId: 'u1',
    categoryId: 'c1',
    systemId: 's1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    requester: { id: 'u1', name: 'Req User', email: 'req@example.com' },
    owner: null
  },
  {
    id: 't2',
    ticketNumber: 'INC-10002',
    summary: 'Printer jammed',
    description: 'Paper jam in HR printer.',
    status: 'IN_PROGRESS',
    itPriority: 'LOW',
    requestedPriority: 'LOW',
    requesterId: 'u2',
    categoryId: 'c1',
    systemId: 's2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    requester: { id: 'u2', name: 'Other Req', email: 'other@example.com' },
    owner: { id: 's1', name: 'Staff User', email: 'staff@example.com' }
  }
];

describe('StaffTicketQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state and then tickets', async () => {
    (api.fetchStaffTickets as any).mockResolvedValueOnce({ data: mockTickets, meta: { totalCount: 2, page: 1, limit: 10, totalPages: 1 } });

    render(
      <BrowserRouter>
        <StaffTicketQueue />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('INC-10001').length).toBeGreaterThan(0);
      expect(screen.getAllByText('INC-10002').length).toBeGreaterThan(0);
    });

    expect(api.fetchStaffTickets).toHaveBeenCalledWith({
      page: 1, limit: 10, search: '', status: '', priority: ''
    });
  });

  it('handles search input', async () => {
    (api.fetchStaffTickets as any).mockResolvedValue({ data: [mockTickets[0]], meta: { totalCount: 1, page: 1, limit: 10, totalPages: 1 } });

    render(
      <BrowserRouter>
        <StaffTicketQueue />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Email' } });
    
    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(api.fetchStaffTickets).toHaveBeenCalledWith({
        page: 1, limit: 10, search: 'Email', status: '', priority: ''
      });
    });
  });
});
