import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../api';

export const ChangePasswordModal: React.FC = () => {
  const { activeUser, setActiveUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!activeUser || !activeUser.requiresPasswordChange) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return setError('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setActiveUser({ ...activeUser, requiresPasswordChange: false });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Change Password</h2>
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          You must change your initial password before you can continue.
        </p>
        
        {error && (
          <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input 
              id="currentPassword"
              type="password" 
              className="form-control"
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input 
              id="newPassword"
              type="password" 
              className="form-control"
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input 
              id="confirmPassword"
              type="password" 
              className="form-control"
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
            {isLoading ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
