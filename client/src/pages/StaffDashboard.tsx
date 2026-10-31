import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchStaffDashboard, StaffDashboardData } from '../api';
import {
  Inbox,
  FolderOpen,
  Activity,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Flame,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Users,
  Search,
  Filter,
  AlertCircle,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { activeUser } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchStaffDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load staff dashboard:', err);
      setError(err.message || 'Unable to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' };
      case 'HIGH':
        return { backgroundColor: '#FFEDD5', color: '#9A3412', border: '1px solid #FED7AA' };
      case 'MEDIUM':
        return { backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' };
      case 'LOW':
        return { backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' };
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'NEW':
        return { backgroundColor: '#E0E7FF', color: '#3730A3', border: '1px solid #C7D2FE' };
      case 'OPEN':
        return { backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD' };
      case 'IN_PROGRESS':
        return { backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' };
      case 'WAITING_FOR_REQUESTER':
        return { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' };
      case 'RESOLVED':
        return { backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' };
    }
  };

  if (loading) {
    return (
      <div className="container" data-testid="dashboard-loading" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading staff dashboard...</div>
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
    <div className="container" data-testid="staff-dashboard" style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>
          Welcome back, {activeUser?.name}!
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Operational overview of the IT Service Desk.
        </p>
      </div>

      {/* Top Ribbon Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {/* New Tickets */}
        <div
          data-testid="card-new-tickets"
          onClick={() => navigate('/staff/tickets?status=NEW')}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>New</span>
            <Inbox width={18} height={18} color="#4338CA" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.metrics.newTickets}
          </div>
        </div>

        {/* Open Tickets */}
        <div
          data-testid="card-open-tickets"
          onClick={() => navigate('/staff/tickets?status=OPEN')}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Open</span>
            <FolderOpen width={18} height={18} color="#0369A1" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.metrics.openTickets}
          </div>
        </div>

        {/* In Progress */}
        <div
          data-testid="card-in-progress-tickets"
          onClick={() => navigate('/staff/tickets?status=IN_PROGRESS')}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>In Progress</span>
            <Activity width={18} height={18} color="#D97706" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.metrics.inProgressTickets}
          </div>
        </div>

        {/* Waiting for Requester */}
        <div
          data-testid="card-waiting-tickets"
          onClick={() => navigate('/staff/tickets?status=WAITING_FOR_REQUESTER')}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Waiting</span>
            <Clock width={18} height={18} color="#DC2626" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#DC2626' }}>
            {data.metrics.waitingForRequester}
          </div>
        </div>

        {/* My Assigned */}
        <div
          data-testid="card-my-assigned-tickets"
          onClick={() => navigate('/staff/tickets?owner=me')}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>My Assigned</span>
            <UserCheck width={18} height={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)' }}>
            {data.metrics.myAssignedTickets}
          </div>
        </div>

        {/* Unassigned */}
        <div
          data-testid="card-unassigned-tickets"
          onClick={() => navigate('/staff/tickets?unassigned=true')}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Unassigned</span>
            <UserX width={18} height={18} color="#4B5563" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.metrics.unassignedTickets}
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '1rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          Queue Quick Actions
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            data-testid="btn-search-queue"
            onClick={() => navigate('/staff/tickets')}
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
            <Search width={16} height={16} /> Search Queue
          </button>
          <button
            data-testid="btn-my-queue"
            onClick={() => navigate('/staff/tickets?owner=me')}
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
            <Filter width={16} height={16} /> My Queue
          </button>
        </div>
      </div>

      {/* Secondary Breakdowns: 2-Column Desktop Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Left Column: Queue by Priority & Admin Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Queue by Priority */}
          <div
            data-testid="priority-breakdown-card"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
              Active Queue by IT Priority
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div
                data-testid="priority-urgent"
                onClick={() => navigate('/staff/tickets?priority=URGENT')}
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '6px',
                  padding: '1rem',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#991B1B', fontWeight: 600, fontSize: '0.875rem' }}>
                  <Flame width={16} height={16} /> Urgent
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#991B1B', marginTop: '0.25rem' }}>
                  {data.ticketsByPriority.URGENT || 0}
                </div>
              </div>

              <div
                data-testid="priority-high"
                onClick={() => navigate('/staff/tickets?priority=HIGH')}
                style={{
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FED7AA',
                  borderRadius: '6px',
                  padding: '1rem',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9A3412', fontWeight: 600, fontSize: '0.875rem' }}>
                  <ArrowUp width={16} height={16} /> High
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#9A3412', marginTop: '0.25rem' }}>
                  {data.ticketsByPriority.HIGH || 0}
                </div>
              </div>

              <div
                data-testid="priority-medium"
                onClick={() => navigate('/staff/tickets?priority=MEDIUM')}
                style={{
                  backgroundColor: '#FEFCE8',
                  border: '1px solid #FEF08A',
                  borderRadius: '6px',
                  padding: '1rem',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#854D0E', fontWeight: 600, fontSize: '0.875rem' }}>
                  <ArrowRight width={16} height={16} /> Medium
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#854D0E', marginTop: '0.25rem' }}>
                  {data.ticketsByPriority.MEDIUM || 0}
                </div>
              </div>

              <div
                data-testid="priority-low"
                onClick={() => navigate('/staff/tickets?priority=LOW')}
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  padding: '1rem',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
                  <ArrowDown width={16} height={16} /> Low
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#374151', marginTop: '0.25rem' }}>
                  {data.ticketsByPriority.LOW || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Stats Card (if Administrator) */}
          {activeUser?.role === 'ADMIN' && data.adminStats && (
            <div
              data-testid="admin-stats-card"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users width={18} height={18} color="var(--primary)" /> Administrator Overview
                </h2>
                <button
                  onClick={() => navigate('/admin/users')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  Manage Users &rarr;
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                <div style={{ backgroundColor: '#F0FDF4', padding: '0.75rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Users</div>
                  <div data-testid="admin-total-users" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {data.adminStats.totalUsers}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F0FDF4', padding: '0.75rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Staff</div>
                  <div data-testid="admin-active-staff" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {data.adminStats.activeStaff}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F0FDF4', padding: '0.75rem', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Requesters</div>
                  <div data-testid="admin-active-requesters" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {data.adminStats.activeRequesters}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recent Service Desk Tickets */}
        <div
          data-testid="recent-queue-card"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0.75rem',
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              Recent Queue Activity
            </h2>
            <button
              onClick={() => navigate('/staff/tickets')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              Full Queue &rarr;
            </button>
          </div>

          {data.recentQueueTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
              <Inbox width={40} height={40} color="var(--border)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>No recent tickets in queue.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.5rem', fontWeight: 600 }}>Ticket #</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600 }}>Summary</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600 }}>Priority</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '0.5rem', fontWeight: 600 }}>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentQueueTickets.map((t) => (
                    <tr
                      key={t.id}
                      data-testid={`queue-ticket-${t.id}`}
                      onClick={() => navigate(`/staff/tickets/${t.id}`)}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {t.ticketNumber}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-primary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.summary}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          ...getPriorityBadgeStyle(t.itPriority),
                        }}>
                          {t.itPriority}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          ...getStatusBadgeStyle(t.status),
                        }}>
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-secondary)' }}>
                        {t.owner ? t.owner.name : <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Unassigned</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
