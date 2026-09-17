import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePasswordModal } from '../../src/components/ChangePasswordModal';
import * as api from '../../src/api';
import { describe, it, expect, vi } from 'vitest';
import * as AuthContext from '../../src/context/AuthContext';

vi.mock('../../src/api', () => ({
  changePassword: vi.fn()
}));

describe('UI-02: ChangePasswordModal Component', () => {
  it('renders and validates password rules', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      activeUser: { id: '1', name: 'Test', email: 'test@example.com', role: 'REQUESTER', requiresPasswordChange: true },
      setActiveUser: vi.fn(),
      isLoading: false,
      logout: vi.fn()
    });

    render(<ChangePasswordModal />);

    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();

    const currentInput = screen.getByLabelText(/Current Password/i);
    const newInput = screen.getByLabelText('New Password');
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    const submitBtn = screen.getByRole('button', { name: /Change Password/i });

    // Test mismatched passwords
    fireEvent.change(currentInput, { target: { value: 'oldpass' } });
    fireEvent.change(newInput, { target: { value: 'NewPass1!' } });
    fireEvent.change(confirmInput, { target: { value: 'NewPass2!' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    // Test weak password
    fireEvent.change(newInput, { target: { value: 'weak' } });
    fireEvent.change(confirmInput, { target: { value: 'weak' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });

    // Valid submission
    fireEvent.change(newInput, { target: { value: 'StrongPass1!' } });
    fireEvent.change(confirmInput, { target: { value: 'StrongPass1!' } });
    vi.mocked(api.changePassword).mockResolvedValueOnce();
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.changePassword).toHaveBeenCalledWith('oldpass', 'StrongPass1!');
    });
  });
});
