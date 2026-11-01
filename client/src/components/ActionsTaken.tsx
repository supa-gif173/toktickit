import React, { useState, useEffect } from 'react';
import { 
  ActionTaken, 
  ActionStatus, 
  User, 
  fetchTicketActions, 
  createTicketAction, 
  updateTicketAction, 
  fetchStaffAssignees 
} from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Lock, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface ActionsTakenProps {
  ticketId: string;
  isStaffOrAdmin?: boolean;
  initialActions?: ActionTaken[];
  onActionsUpdated?: (actions: ActionTaken[]) => void;
}

export const ActionsTaken: React.FC<ActionsTakenProps> = ({
  ticketId,
  isStaffOrAdmin = false,
  initialActions,
  onActionsUpdated
}) => {
  const { activeUser } = useAuth();
  const [actions, setActions] = useState<ActionTaken[]>(initialActions || []);
  const [assignees, setAssignees] = useState<User[]>([]);
  const [loading, setLoading] = useState(!initialActions);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionTaken | null>(null);

  // Create Form State
  const [createDescription, setCreateDescription] = useState('');
  const [createStatus, setCreateStatus] = useState<ActionStatus>('PENDING');
  const [createAssigneeId, setCreateAssigneeId] = useState('');
  const [createActionDateTime, setCreateActionDateTime] = useState('');
  const [createResult, setCreateResult] = useState('');
  const [createFollowUpRequired, setCreateFollowUpRequired] = useState(false);
  const [createFollowUpNote, setCreateFollowUpNote] = useState('');
  const [createAttachmentNotes, setCreateAttachmentNotes] = useState('');
  const [createFormError, setCreateFormError] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit Form State
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<ActionStatus>('PENDING');
  const [editAssigneeId, setEditAssigneeId] = useState('');
  const [editResult, setEditResult] = useState('');
  const [editFollowUpRequired, setEditFollowUpRequired] = useState(false);
  const [editFollowUpNote, setEditFollowUpNote] = useState('');
  const [editAttachmentNotes, setEditAttachmentNotes] = useState('');
  const [editFormError, setEditFormError] = useState('');
  const [editConflictError, setEditConflictError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    loadActions();
    if (isStaffOrAdmin) {
      loadAssignees();
    }
  }, [ticketId, isStaffOrAdmin]);

  const loadActions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchTicketActions(ticketId);
      setActions(data);
      if (onActionsUpdated) onActionsUpdated(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load actions taken.');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignees = async () => {
    try {
      const data = await fetchStaffAssignees();
      setAssignees(data);
    } catch (err) {
      // In tests or if endpoint not reachable, fallback gracefully
      setAssignees([]);
    }
  };

  const openCreateModal = () => {
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setCreateActionDateTime(localIso);
    setCreateDescription('');
    setCreateStatus('PENDING');
    setCreateAssigneeId(activeUser?.id || '');
    setCreateResult('');
    setCreateFollowUpRequired(false);
    setCreateFollowUpNote('');
    setCreateAttachmentNotes('');
    setCreateFormError('');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateFormError('');

    if (!createDescription.trim()) {
      setCreateFormError('Action description is required.');
      return;
    }

    if (createStatus === 'COMPLETED' && !createResult.trim()) {
      setCreateFormError('Result is required when action is marked as completed.');
      return;
    }

    if (createFollowUpRequired && !createFollowUpNote.trim()) {
      setCreateFormError('Follow-up note is required when follow-up is requested.');
      return;
    }

    setCreateSubmitting(true);
    try {
      await createTicketAction(ticketId, {
        description: createDescription.trim(),
        status: createStatus,
        assigneeId: createAssigneeId ? createAssigneeId : null,
        actionDateTime: createActionDateTime ? new Date(createActionDateTime).toISOString() : undefined,
        result: createResult.trim() || undefined,
        followUpRequired: createFollowUpRequired,
        followUpNote: createFollowUpRequired ? createFollowUpNote.trim() : undefined,
        attachmentNotes: createAttachmentNotes.trim() || undefined,
      });

      setIsCreateOpen(false);
      setSuccessMsg('Action Taken recorded successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      await loadActions();
    } catch (err: any) {
      setCreateFormError(err.message || 'Failed to record action taken.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEditModal = (action: ActionTaken) => {
    setEditingAction(action);
    setEditDescription(action.description || '');
    setEditStatus(action.status);
    setEditAssigneeId(action.assigneeId || '');
    setEditResult(action.result || '');
    setEditFollowUpRequired(Boolean(action.followUpRequired));
    setEditFollowUpNote(action.followUpNote || '');
    setEditAttachmentNotes(action.attachmentNotes || '');
    setEditFormError('');
    setEditConflictError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction) return;

    setEditFormError('');
    setEditConflictError('');

    if (!editDescription.trim()) {
      setEditFormError('Action description is required.');
      return;
    }

    if (editStatus === 'COMPLETED' && !editResult.trim()) {
      setEditFormError('Result is required when action is marked as completed.');
      return;
    }

    if (editFollowUpRequired && !editFollowUpNote.trim()) {
      setEditFormError('Follow-up note is required when follow-up is requested.');
      return;
    }

    setEditSubmitting(true);
    try {
      await updateTicketAction(ticketId, editingAction.id, {
        description: editDescription.trim(),
        status: editStatus,
        assigneeId: editAssigneeId ? editAssigneeId : null,
        result: editResult.trim() || null,
        followUpRequired: editFollowUpRequired,
        followUpNote: editFollowUpRequired ? editFollowUpNote.trim() : null,
        attachmentNotes: editAttachmentNotes.trim() || null,
        expectedVersion: editingAction.version,
      });

      setEditingAction(null);
      setSuccessMsg('Action Taken updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      await loadActions();
    } catch (err: any) {
      if (err.status === 409 || err.message?.toLowerCase().includes('another user') || err.message?.toLowerCase().includes('conflict')) {
        setEditConflictError('Action Taken has been modified by another user. Please reload the latest action details.');
      } else {
        setEditFormError(err.message || 'Failed to update action taken.');
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const renderStatusBadge = (status: ActionStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span
            data-testid="status-badge-pending"
            style={{
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FCD34D',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Pending
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span
            data-testid="status-badge-in-progress"
            style={{
              backgroundColor: '#DBEAFE',
              color: '#1E40AF',
              border: '1px solid #93C5FD',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span
            data-testid="status-badge-completed"
            style={{
              backgroundColor: '#D1FAE5',
              color: '#065F46',
              border: '1px solid #6EE7B7',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span
            data-testid="status-badge-cancelled"
            style={{
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
              border: '1px solid #D1D5DB',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'line-through',
            }}
          >
            Cancelled
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const formatDateTime = (dtStr: string) => {
    try {
      const d = new Date(dtStr);
      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dtStr;
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginTop: '1.5rem',
      }}
      data-testid="actions-taken-section"
    >
      {/* Header and Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Actions Taken
          </h3>
          <span
            data-testid="actions-count-badge"
            style={{
              backgroundColor: 'var(--pale-green)',
              color: 'var(--primary)',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {actions.length}
          </span>
        </div>

        {isStaffOrAdmin && (
          <button
            type="button"
            className="btn-primary"
            onClick={openCreateModal}
            data-testid="add-action-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
              padding: '0.5rem 1rem',
            }}
          >
            <Plus size={16} /> + Add Action
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div
          data-testid="actions-success-alert"
          style={{
            backgroundColor: '#ECFDF5',
            color: '#065F46',
            border: '1px solid #A7F3D0',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {error && (
        <div
          data-testid="actions-error-alert"
          style={{
            backgroundColor: '#FEF2F2',
            color: '#B91C1C',
            border: '1px solid #FECACA',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading actions taken...
        </div>
      ) : actions.length === 0 ? (
        <div
          data-testid="no-actions-msg"
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            border: '1px dashed var(--border)',
            borderRadius: '6px',
          }}
        >
          No actions taken recorded yet.
        </div>
      ) : (
        <>
          {/* Desktop / Tablet Table View */}
          <table className="desktop-table" data-testid="actions-table" aria-label="Actions Taken">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Date / Time</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Assignee</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Performed By</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Description</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Result</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Follow-Up</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Attachments</th>
                {isStaffOrAdmin && <th style={{ padding: '0.75rem 0.5rem' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {actions.map((act) => {
                const isTerminal = act.status === 'COMPLETED' || act.status === 'CANCELLED';
                return (
                  <tr
                    key={act.id}
                    data-testid={`action-row-${act.id}`}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      verticalAlign: 'top',
                    }}
                  >
                    <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      {formatDateTime(act.actionDateTime)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {renderStatusBadge(act.status)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>
                      {act.assignee ? (
                        <span>
                          {act.assignee.name}
                          {act.assignee.isActive === false && (
                            <span
                              data-testid="inactive-assignee-pill"
                              style={{
                                marginLeft: '0.35rem',
                                padding: '0.1rem 0.35rem',
                                backgroundColor: '#FEE2E2',
                                color: '#B91C1C',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              [Inactive]
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>
                      {act.performedBy?.name || 'Staff'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem', maxWidth: '240px' }}>
                      <div style={{ wordBreak: 'break-word' }}>{act.description}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem', maxWidth: '200px' }}>
                      <div style={{ wordBreak: 'break-word', color: act.result ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {act.result || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>
                      {act.followUpRequired ? (
                        <div>
                          <span
                            data-testid="follow-up-required-badge"
                            style={{
                              backgroundColor: '#FEF3C7',
                              color: '#B45309',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'inline-block',
                              marginBottom: '0.25rem',
                            }}
                          >
                            Required
                          </span>
                          {act.followUpNote && (
                            <div
                              data-testid="follow-up-note-text"
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)',
                                fontStyle: 'italic',
                                wordBreak: 'break-word',
                              }}
                            >
                              Note: {act.followUpNote}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span
                          style={{
                            backgroundColor: '#F3F4F6',
                            color: '#6B7280',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                          }}
                        >
                          None
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {act.attachmentNotes || '—'}
                    </td>
                    {isStaffOrAdmin && (
                      <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                        {isTerminal ? (
                          <span
                            data-testid="terminal-locked-badge"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              backgroundColor: '#F3F4F6',
                              color: '#6B7280',
                              border: '1px solid #D1D5DB',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <Lock size={12} /> [Locked]
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => openEditModal(act)}
                            data-testid={`edit-action-btn-${act.id}`}
                            style={{
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.8rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Cards View (< 768px) */}
          <div className="mobile-cards" data-testid="actions-mobile-cards">
            {actions.map((act) => {
              const isTerminal = act.status === 'COMPLETED' || act.status === 'CANCELLED';
              return (
                <div
                  key={act.id}
                  className="mobile-card"
                  data-testid={`action-card-${act.id}`}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDateTime(act.actionDateTime)}
                    </span>
                    <div>{renderStatusBadge(act.status)}</div>
                  </div>

                  <div>
                    <strong>Description:</strong>
                    <div style={{ marginTop: '0.2rem', wordBreak: 'break-word' }}>{act.description}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Assignee: </span>
                      <strong>
                        {act.assignee ? act.assignee.name : 'Unassigned'}
                        {act.assignee?.isActive === false && ' [Inactive]'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Performed By: </span>
                      <strong>{act.performedBy?.name || 'Staff'}</strong>
                    </div>
                  </div>

                  {act.result && (
                    <div style={{ fontSize: '0.85rem', backgroundColor: 'var(--pale-green)', padding: '0.5rem', borderRadius: '4px' }}>
                      <strong>Result:</strong> {act.result}
                    </div>
                  )}

                  {act.followUpRequired && (
                    <div style={{ fontSize: '0.85rem', backgroundColor: '#FEF3C7', padding: '0.5rem', borderRadius: '4px', color: '#92400E' }}>
                      <strong>Follow-Up Required:</strong> {act.followUpNote || 'Yes'}
                    </div>
                  )}

                  {act.attachmentNotes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>Attachments:</strong> {act.attachmentNotes}
                    </div>
                  )}

                  {isStaffOrAdmin && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                      {isTerminal ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            backgroundColor: '#F3F4F6',
                            color: '#6B7280',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                          }}
                        >
                          <Lock size={12} /> [Locked]
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => openEditModal(act)}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          Edit Action
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CREATE ACTION MODAL */}
      {isCreateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-action-modal-title"
          data-testid="create-action-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <h3 id="create-action-modal-title" style={{ marginBottom: '1.2rem', color: 'var(--text-primary)' }}>
              Add Action Taken
            </h3>

            {createFormError && (
              <div
                data-testid="create-form-error"
                style={{
                  backgroundColor: '#FEF2F2',
                  color: '#B91C1C',
                  border: '1px solid #FECACA',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                }}
              >
                {createFormError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} noValidate>
              <div className="form-grid single-column">
                {/* Date & Performed By (Read-only / Audit) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="create-action-date">
                      Action Date / Time
                    </label>
                    <input
                      id="create-action-date"
                      type="datetime-local"
                      className="form-input"
                      value={createActionDateTime}
                      onChange={(e) => setCreateActionDateTime(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Performed By</label>
                    <input
                      type="text"
                      className="form-input"
                      value={activeUser?.name || 'Current User'}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Status and Assignee */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="create-action-status">
                      Status <span className="required">*</span>
                    </label>
                    <select
                      id="create-action-status"
                      className="form-select"
                      value={createStatus}
                      onChange={(e) => setCreateStatus(e.target.value as ActionStatus)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="create-action-assignee">
                      Assignee
                    </label>
                    <select
                      id="create-action-assignee"
                      className="form-select"
                      value={createAssigneeId}
                      onChange={(e) => setCreateAssigneeId(e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {assignees.map((user) => (
                        <option
                          key={user.id}
                          value={user.id}
                          disabled={user.isActive === false}
                        >
                          {user.name} ({user.role}) {user.isActive === false ? '[Inactive]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="create-action-description">
                    Action Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="create-action-description"
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe the action or diagnostic step taken..."
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                  />
                </div>

                {/* Result / Outcome */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="create-action-result">
                    Result / Outcome {createStatus === 'COMPLETED' && <span className="required">*</span>}
                  </label>
                  <textarea
                    id="create-action-result"
                    className="form-textarea"
                    rows={2}
                    placeholder={
                      createStatus === 'COMPLETED'
                        ? 'Mandatory outcome for completed action...'
                        : 'Action result or resolution notes (optional until completed)...'
                    }
                    value={createResult}
                    onChange={(e) => setCreateResult(e.target.value)}
                  />
                </div>

                {/* Follow-up Required Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.4rem 0' }}>
                  <input
                    id="create-action-followup-toggle"
                    type="checkbox"
                    checked={createFollowUpRequired}
                    onChange={(e) => setCreateFollowUpRequired(e.target.checked)}
                    style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="create-action-followup-toggle" style={{ fontWeight: 500, cursor: 'pointer' }}>
                    Follow-Up Required
                  </label>
                </div>

                {/* Follow-up Note (Conditional) */}
                {createFollowUpRequired && (
                  <div className="form-group" style={{ marginBottom: 0 }} data-testid="create-followup-note-field">
                    <label className="form-label" htmlFor="create-action-followup-note">
                      Follow-Up Note <span className="required">*</span>
                    </label>
                    <textarea
                      id="create-action-followup-note"
                      className="form-textarea"
                      rows={2}
                      placeholder="Specify required follow-up action or deadline..."
                      value={createFollowUpNote}
                      onChange={(e) => setCreateFollowUpNote(e.target.value)}
                    />
                  </div>
                )}

                {/* Attachment Notes */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="create-action-attachments">
                    Attachment Notes
                  </label>
                  <input
                    id="create-action-attachments"
                    type="text"
                    className="form-input"
                    placeholder="e.g. See diagnostic-report.pdf"
                    value={createAttachmentNotes}
                    onChange={(e) => setCreateAttachmentNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={createSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createSubmitting}
                  data-testid="submit-create-action-btn"
                >
                  {createSubmitting ? 'Saving...' : 'Save Action Taken'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACTION MODAL */}
      {editingAction && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-action-modal-title"
          data-testid="edit-action-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <h3 id="edit-action-modal-title" style={{ marginBottom: '1.2rem', color: 'var(--text-primary)' }}>
              Edit Action Taken
            </h3>

            {editConflictError ? (
              <div
                data-testid="edit-conflict-error"
                style={{
                  backgroundColor: '#FFFBEB',
                  color: '#92400E',
                  border: '1px solid #FCD34D',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <AlertTriangle size={20} color="#F59E0B" /> Concurrency Conflict
                </div>
                <div>{editConflictError}</div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingAction(null);
                    loadActions();
                  }}
                  style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                >
                  Reload Actions
                </button>
              </div>
            ) : null}

            {editFormError && (
              <div
                data-testid="edit-form-error"
                style={{
                  backgroundColor: '#FEF2F2',
                  color: '#B91C1C',
                  border: '1px solid #FECACA',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                }}
              >
                {editFormError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} noValidate>
              <div className="form-grid single-column">
                {/* Audit Read-only fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Action Date / Time</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formatDateTime(editingAction.actionDateTime)}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Performed By</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingAction.performedBy?.name || 'Staff'}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Status and Assignee */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="edit-action-status">
                      Status <span className="required">*</span>
                    </label>
                    <select
                      id="edit-action-status"
                      className="form-select"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as ActionStatus)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="edit-action-assignee">
                      Assignee
                    </label>
                    <select
                      id="edit-action-assignee"
                      className="form-select"
                      value={editAssigneeId}
                      onChange={(e) => setEditAssigneeId(e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {assignees.map((user) => (
                        <option
                          key={user.id}
                          value={user.id}
                          disabled={user.isActive === false}
                        >
                          {user.name} ({user.role}) {user.isActive === false ? '[Inactive]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="edit-action-description">
                    Action Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="edit-action-description"
                    className="form-textarea"
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>

                {/* Result / Outcome */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="edit-action-result">
                    Result / Outcome {editStatus === 'COMPLETED' && <span className="required">*</span>}
                  </label>
                  <textarea
                    id="edit-action-result"
                    className="form-textarea"
                    rows={2}
                    placeholder={
                      editStatus === 'COMPLETED'
                        ? 'Mandatory outcome for completed action...'
                        : 'Outcome or work notes...'
                    }
                    value={editResult}
                    onChange={(e) => setEditResult(e.target.value)}
                  />
                </div>

                {/* Follow-up Required Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.4rem 0' }}>
                  <input
                    id="edit-action-followup-toggle"
                    type="checkbox"
                    checked={editFollowUpRequired}
                    onChange={(e) => setEditFollowUpRequired(e.target.checked)}
                    style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="edit-action-followup-toggle" style={{ fontWeight: 500, cursor: 'pointer' }}>
                    Follow-Up Required
                  </label>
                </div>

                {/* Follow-up Note (Conditional) */}
                {editFollowUpRequired && (
                  <div className="form-group" style={{ marginBottom: 0 }} data-testid="edit-followup-note-field">
                    <label className="form-label" htmlFor="edit-action-followup-note">
                      Follow-Up Note <span className="required">*</span>
                    </label>
                    <textarea
                      id="edit-action-followup-note"
                      className="form-textarea"
                      rows={2}
                      value={editFollowUpNote}
                      onChange={(e) => setEditFollowUpNote(e.target.value)}
                    />
                  </div>
                )}

                {/* Attachment Notes */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="edit-action-attachments">
                    Attachment Notes
                  </label>
                  <input
                    id="edit-action-attachments"
                    type="text"
                    className="form-input"
                    value={editAttachmentNotes}
                    onChange={(e) => setEditAttachmentNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingAction(null)}
                  disabled={editSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={editSubmitting || Boolean(editConflictError)}
                  data-testid="submit-edit-action-btn"
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsTaken;
