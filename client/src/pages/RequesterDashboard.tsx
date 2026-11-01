import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchRequesterDashboard, RequesterDashboardData } from '../api';
import { PlusCircle, List, Clock, AlertCircle, CheckCircle2, Ticket as TicketIcon } from 'lucide-react';

export const RequesterDashboard: React.FC = () => {
  const { activeUser } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<RequesterDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchRequesterDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load requester dashboard:', err);
      setError(err.message || 'Unable to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD' };
      case 'IN_PROGRESS':
        return { backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' };
      case 'WAITING_FOR_REQUESTER':
        return { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' };
      case 'RESOLVED':
        return { backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' };
      case 'CLOSED':
        return { backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' };
      case 'CANCELLED':
        return { backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' };
      default:
        return { backgroundColor: '#E0E7FF', color: '#3730A3', border: '1px solid #C7D2FE' };
    }
  };

  if (loading) {
    return (
      <div className="container" data-testid="dashboard-loading" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading your dashboard...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" data-testid="dashboard-error" style={{ padding: '2rem 1rem' }}>
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
          color: '#991B1B',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <AlertCircle width={32} height={32} color="#DC2626" />
          </div>
          <p style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>{error || 'Unable to load dashboard data. Please try refreshing.'}</p>
          <button
            onClick={loadDashboard}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" data-testid="requester-dashboard" style={{ padding: '1rem' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>
          Welcome back, {activeUser?.name}!
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Here's what's happening with your requests.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {/* Card 1: My Open Tickets */}
        <div
          data-testid="card-open-tickets"
          onClick={() => navigate('/tickets?status=open')}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{
            backgroundColor: 'var(--pale-green)',
            borderRadius: '12px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TicketIcon width={24} height={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>My Open Tickets</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {data.metrics.myOpenTickets}
            </div>
          </div>
        </div>

        {/* Card 2: Waiting on Me */}
        <div
          data-testid="card-waiting-tickets"
          onClick={() => navigate('/tickets?status=WAITING_FOR_REQUESTER')}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{
            backgroundColor: '#FEF3C7',
            borderRadius: '12px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Clock width={24} height={24} color="#D97706" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Waiting on Me</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#B45309' }}>
              {data.metrics.waitingForRequester}
            </div>
          </div>
        </div>

        {/* Card 3: Recently Resolved */}
        <div
          data-testid="card-resolved-tickets"
          onClick={() => navigate('/tickets?status=RESOLVED')}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{
            backgroundColor: '#DCFCE7',
            borderRadius: '12px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckCircle2 width={24} height={24} color="#16A34A" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Recently Resolved</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {data.metrics.recentlyResolved}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
          Quick Actions
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            data-testid="btn-create-ticket"
            onClick={() => navigate('/tickets/new')}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontWeight: 500,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <PlusCircle width={16} height={16} /> + Create Ticket
          </button>
          <button
            data-testid="btn-view-tickets"
            onClick={() => navigate('/tickets')}
            style={{
              backgroundColor: 'white',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontWeight: 500,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <List width={16} height={16} /> View My Tickets
          </button>
        </div>
      </div>

      {/* My Recent Tickets Table */}
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.75rem',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            My Recent Tickets
          </h2>
          <button
            onClick={() => navigate('/tickets')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            View all &rarr;
          </button>
        </div>

        {data.recentTickets.length === 0 ? (
          <div data-testid="empty-recent-tickets" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
            <TicketIcon width={40} height={40} color="var(--border)" style={{ marginBottom: '0.75rem' }} />
            <p style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>No tickets yet. Need help? Create your first ticket.</p>
            <button
              onClick={() => navigate('/tickets/new')}
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              + Create Ticket
            </button>
          </div>
        ) : (
          <div data-testid="recent-tickets-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Ticket #</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Summary</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTickets.map((t) => (
                  <tr
                    key={t.id}
                    data-testid={`recent-ticket-${t.id}`}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {t.ticketNumber}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-primary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.summary}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        ...getStatusBadgeStyle(t.status),
                      }}>
                        {t.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {new Date(t.updatedAt).toLocaleDateString()} {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequesterDashboard;
