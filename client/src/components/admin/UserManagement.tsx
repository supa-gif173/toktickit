import React, { useState, useEffect } from 'react';
import { fetchAdminUsers, createAdminUser, updateAdminUser, User } from '../../api';
import { Search, Filter, AlertCircle, Plus, Edit2, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserManagement: React.FC = () => {
  const { activeUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'REQUESTER',
    isActive: true,
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminUsers({ search, role: roleFilter });
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]); // Re-fetch on role filter change

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'REQUESTER', isActive: true, password: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, isActive: user.requiresPasswordChange === undefined ? (user as any).isActive : true, password: '' });
    // In our api.ts `User` interface, `isActive` is missing, but it comes from the backend. 
    // We cast it or assume it exists. Actually, we should use the fetched `isActive` property.
    setFormData(prev => ({ ...prev, isActive: (user as any).isActive ?? true }));
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    setSuccess('');

    try {
      if (editingUser) {
        // Edit
        const payload: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await updateAdminUser(editingUser.id, payload);
        setSuccess(`User ${formData.name} updated successfully.`);
      } else {
        // Create
        if (!formData.password) {
          throw new Error("Password is required for new users");
        }
        await createAdminUser({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
          password: formData.password
        });
        setSuccess(`User ${formData.name} created successfully.`);
      }
      closeModal();
      loadUsers(); // Refresh list
    } catch (err: any) {
      setFormError(err.message || 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    let bg = 'var(--background)';
    let color = 'var(--text-secondary)';
    if (role === 'ADMIN') { bg = '#FEE2E2'; color = '#991B1B'; }
    else if (role === 'STAFF') { bg = '#FEF3C7'; color = '#B45309'; }
    else if (role === 'REQUESTER') { bg = '#E0F2FE'; color = '#0369A1'; }
    
    return (
      <span style={{ backgroundColor: bg, color, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
        {role}
      </span>
    );
  };

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>User Management</h2>
        <button onClick={openCreateModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New User
        </button>
      </div>

      {success && (
        <div style={{ backgroundColor: 'var(--pale-green)', color: 'var(--success)', border: '1px solid var(--success)', padding: '1rem', borderRadius: '6px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} /> {success}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: 'var(--error)', padding: '1rem', borderRadius: '6px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 300px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search name or email" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 0, flex: 1 }}
          />
          <button type="submit" className="btn-secondary"><Search size={18} /></button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
          <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ marginBottom: 0 }}>
            <option value="">All Roles</option>
            <option value="REQUESTER">Requester</option>
            <option value="STAFF">IT Staff</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading users...</div>
      ) : (
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <table className="desktop-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--pale-green)', borderBottom: '2px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    {u.name} {(u.id === activeUser?.id) && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>(You)</span>}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>{getRoleBadge(u.role)}</td>
                  <td style={{ padding: '1rem' }}>
                    {(u as any).isActive ? (
                      <span style={{ color: 'var(--success)', fontWeight: 500, fontSize: '0.9rem' }}>Active</span>
                    ) : (
                      <span style={{ color: 'var(--error)', fontWeight: 500, fontSize: '0.9rem' }}>Inactive</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => openEditModal(u)}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingUser ? 'Edit User' : 'Create New User'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            {formError && (
              <div style={{ backgroundColor: '#FEE2E2', color: 'var(--error)', padding: '0.8rem', borderRadius: '6px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <AlertCircle size={18} /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="userName">Full Name</label>
                <input 
                  id="userName"
                  type="text" 
                  className="form-input" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="userEmail">Email Address</label>
                <input 
                  id="userEmail"
                  type="email" 
                  className="form-input" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="userRole">Role</label>
                  <select 
                    id="userRole"
                    className="form-select" 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="REQUESTER">Requester</option>
                    <option value="STAFF">IT Staff</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="userStatus">Account Status</label>
                  <select 
                    id="userStatus"
                    className="form-select" 
                    value={formData.isActive ? "true" : "false"}
                    onChange={e => setFormData({...formData, isActive: e.target.value === "true"})}
                    disabled={editingUser?.id === activeUser?.id}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  {editingUser?.id === activeUser?.id && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>You cannot deactivate yourself.</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="userPassword">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Initial Password'}
                </label>
                <input 
                  id="userPassword"
                  type="password" 
                  className="form-input" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required={!editingUser}
                />
                {!editingUser && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    User will be forced to change this upon first login.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
