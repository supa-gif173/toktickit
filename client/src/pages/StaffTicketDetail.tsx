import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStaffTicketDetails, claimTicket, assignTicket, updateTicketPriority, updateTicketStatus, Ticket } from '../api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

const StaffTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeUser } = useAuth();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit state
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchStaffTicketDetails(id!);
      setTicket(data);
      setStatus(data.status.toUpperCase());
      setPriority(data.itPriority.toUpperCase());
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!ticket) return;
    setActionLoading(true);
    setSuccessMsg('');
    setError('');
    try {
      const data = await claimTicket(ticket.id);
      setTicket({ ...ticket, ownerId: data.ownerId, owner: { ...ticket.owner, id: data.ownerId!, name: activeUser?.name || 'You', email: activeUser?.email || '', role: activeUser?.role || 'STAFF', requiresPasswordChange: false } });
      setSuccessMsg('Ticket claimed successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to claim ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    setActionLoading(true);
    setSuccessMsg('');
    setError('');
    try {
      const data = await assignTicket(ticket.id, assigneeId || null);
      setTicket({ ...ticket, ownerId: data.ownerId, owner: data.ownerId ? { id: data.ownerId, name: 'Assigned User', email: '', role: 'STAFF', requiresPasswordChange: false } : undefined });
      setAssigneeId('');
      setSuccessMsg('Assignment updated successfully!');
      // Reload to get actual user name if needed
      loadTicket();
    } catch (err: any) {
      setError(err.message || 'Failed to assign ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    setActionLoading(true);
    setSuccessMsg('');
    setError('');
    try {
      await updateTicketStatus(ticket.id, newStatus);
      setStatus(newStatus);
      setTicket({ ...ticket, status: newStatus });
      setSuccessMsg('Status updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
      // Revert status dropdown if failed
      setStatus(ticket.status);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!ticket) return;
    setActionLoading(true);
    setSuccessMsg('');
    setError('');
    try {
      await updateTicketPriority(ticket.id, newPriority);
      setPriority(newPriority);
      setTicket({ ...ticket, itPriority: newPriority });
      setSuccessMsg('Priority updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update priority.');
      // Revert dropdown if failed
      setPriority(ticket.itPriority);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading ticket details...</div>;
  }

  if (error && !ticket) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <button onClick={() => navigate('/staff/tickets')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <ArrowLeft size={18} /> Back to Queue
        </button>
        <div style={{ backgroundColor: '#FEE2E2', color: 'var(--error)', padding: '1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> {error}
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const isOwner = ticket.ownerId === activeUser?.id;

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/staff/tickets')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Back to Queue
        </button>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>
          {ticket.ticketNumber}
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: 'var(--error)', padding: '1rem', borderRadius: '6px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: 'var(--pale-green)', border: '1px solid var(--success)', color: 'var(--success)', padding: '1rem', borderRadius: '6px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}

      <div className="form-grid">
        {/* Left Column: Ticket Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{ticket.summary}</h2>
            
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Requester</div>
                <div style={{ fontWeight: 500 }}>{ticket.requester?.name || 'Unknown'} ({ticket.requester?.email})</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Category</div>
                <div style={{ fontWeight: 500 }}>{ticket.category?.name || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>System</div>
                <div style={{ fontWeight: 500 }}>{ticket.system?.name || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Created At</div>
                <div style={{ fontWeight: 500 }}>{new Date(ticket.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description</div>
              <div style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '6px', whiteSpace: 'pre-wrap', border: '1px solid var(--border)' }}>
                {ticket.description}
              </div>
            </div>

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Attachments</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {ticket.attachments.map(a => (
                    <li key={a.id} style={{ padding: '0.8rem', backgroundColor: 'var(--pale-green)', borderRadius: '6px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500 }}>{a.fileName}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{(a.fileSize / 1024).toFixed(1)} KB</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: IT Operations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Assignment & Ownership */}
          <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: isOwner ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={20} className="text-primary" /> Ticket Assignment
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Current Owner</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                {ticket.owner ? `${ticket.owner.name} ${isOwner ? '(You)' : ''}` : 'Unassigned'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {!isOwner && (
                <button 
                  className="btn-primary" 
                  onClick={handleClaim}
                  disabled={actionLoading}
                  style={{ flex: 1 }}
                >
                  {actionLoading ? 'Processing...' : 'Claim Ticket'}
                </button>
              )}
            </div>

            <form onSubmit={handleAssign} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Assignee User ID" 
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                style={{ flex: 1, padding: '0.4rem' }}
                disabled={actionLoading}
              />
              <button type="submit" className="btn-secondary" disabled={actionLoading || !assigneeId}>
                Assign
              </button>
            </form>
          </div>

          {/* IT Operations */}
          <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>IT Operations</h3>
            
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-select" 
                value={status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={actionLoading}
              >
                {(() => {
                  const currentStatus = ticket.status.toUpperCase().replace(" ", "_");
                  const transitionMatrix: Record<string, string[]> = {
                    NEW: ["OPEN", "IN_PROGRESS", "CANCELLED", "RESOLVED", "CLOSED"],
                    OPEN: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED", "CLOSED"],
                    IN_PROGRESS: ["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED", "CLOSED", "OPEN"],
                    WAITING_FOR_REQUESTER: ["IN_PROGRESS", "RESOLVED", "CANCELLED", "CLOSED", "OPEN"],
                    RESOLVED: ["CLOSED", "REOPENED"],
                    CLOSED: ["REOPENED"],
                    REOPENED: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED", "CLOSED"],
                    CANCELLED: []
                  };
                  
                  const allStatuses = ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CLOSED", "REOPENED", "CANCELLED"];
                  const allowed = transitionMatrix[currentStatus] || [];
                  
                  // Always include the current status as an option
                  const formatLabel = (str: string) => str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                  return allStatuses
                    .filter(s => s === currentStatus || allowed.includes(s))
                    .map(s => <option key={s} value={s}>{formatLabel(s)}</option>);
                })()}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">IT Priority</label>
              <select 
                className="form-select" 
                value={priority.toUpperCase()}
                onChange={e => handlePriorityChange(e.target.value)}
                disabled={actionLoading}
              >
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Requested Priority</div>
              <div style={{ fontWeight: 500 }}>{ticket.requestedPriority}</div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StaffTicketDetail;
