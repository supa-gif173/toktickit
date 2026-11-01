import React, { useState, useEffect } from 'react';
import { StatusHistoryEntry, fetchTicketHistory } from '../api';
import { Clock, ArrowRight, User as UserIcon } from 'lucide-react';

interface TicketHistoryProps {
  ticketId: string;
  initialHistory?: StatusHistoryEntry[];
}

export const TicketHistory: React.FC<TicketHistoryProps> = ({
  ticketId,
  initialHistory
}) => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>(initialHistory || []);
  const [loading, setLoading] = useState(!initialHistory);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, [ticketId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchTicketHistory(ticketId);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load status history.');
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (st: string) => {
    return st.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
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
      }}
      data-testid="ticket-history-widget"
    >
      <h3
        style={{
          marginBottom: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1.1rem',
          fontWeight: 600,
        }}
      >
        <Clock size={18} className="text-primary" /> Status Audit History
      </h3>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
          Loading history timeline...
        </div>
      ) : error ? (
        <div style={{ color: 'var(--error)', fontSize: '0.85rem' }}>
          {error}
        </div>
      ) : history.length === 0 ? (
        <div
          data-testid="empty-history-msg"
          style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}
        >
          No status transitions recorded yet.
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative',
            paddingLeft: '0.5rem',
          }}
          data-testid="history-timeline"
        >
          {history.map((entry, index) => (
            <div
              key={entry.id || index}
              data-testid={`history-entry-${entry.id || index}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                borderLeft: '2px solid var(--border)',
                paddingLeft: '1rem',
                position: 'relative',
              }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '-6px',
                  top: '4px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                }}
              />

              {/* Status Transition Chip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    backgroundColor: '#F3F4F6',
                    color: 'var(--text-secondary)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                  data-testid="history-from-status"
                >
                  {formatStatus(entry.fromStatus)}
                </span>
                <ArrowRight size={14} color="var(--text-secondary)" />
                <span
                  style={{
                    backgroundColor: 'var(--pale-green)',
                    color: 'var(--primary)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                  data-testid="history-to-status"
                >
                  {formatStatus(entry.toStatus)}
                </span>
              </div>

              {/* Actor and Timestamp */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <UserIcon size={12} />
                  <strong data-testid="history-changed-by">
                    {entry.changedBy?.name || 'System / Staff'}
                  </strong>
                  {entry.changedBy?.role && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.05rem 0.3rem',
                        backgroundColor: '#E5E7EB',
                        borderRadius: '3px',
                        marginLeft: '0.2rem',
                      }}
                    >
                      {entry.changedBy.role}
                    </span>
                  )}
                </span>
                <span>•</span>
                <span data-testid="history-timestamp">{formatDateTime(entry.changedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketHistory;
