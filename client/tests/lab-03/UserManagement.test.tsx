import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UserManagement from '../../src/components/admin/UserManagement';
import * as authContext from '../../src/context/AuthContext';
import * as api from '../../src/api';

vi.mock('../../src/api');
vi.mock('../../src/context/AuthContext', async () => {
  const actual = await vi.importActual('../../src/context/AuthContext');
  return {
    ...actual as any,
    useAuth: vi.fn(),
  };
});

const mockActiveUser = {
  id: 'admin-id',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'ADMIN' as const,
  requiresPasswordChange: false,
};

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'REQUESTER', isActive: true, requiresPasswordChange: false },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'STAFF', isActive: true, requiresPasswordChange: false },
];

describe('UserManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchAdminUsers as any).mockResolvedValue(mockUsers);
    (authContext.useAuth as any).mockReturnValue({
      activeUser: mockActiveUser,
      isLoading: false,
    });
  });

  const renderComponent = () => {
    return render(<UserManagement />);
  };

  it('renders user management and fetches users', async () => {
    renderComponent();
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('filters by role', async () => {
    renderComponent();
    
    const roleSelect = screen.getByRole('combobox');
    fireEvent.change(roleSelect, { target: { value: 'STAFF' } });
    
    await waitFor(() => {
      expect(api.fetchAdminUsers).toHaveBeenCalledWith({ search: '', role: 'STAFF' });
    });
  });

  it('opens create modal', async () => {
    renderComponent();
    
    const addButton = screen.getByText('Add New User');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Create New User')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
  });
});
