import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStaffTickets, Ticket } from '../api';
import { Search, Filter, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const StaffTicketQueue: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<any>({});
  
  // Filters and pagination
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchStaffTickets({ page, limit: 10, search, status, priority });
      setTickets(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err.message || 'Failed to load queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [page, status, priority]); // Search needs manual trigger

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTickets();
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setPage(1);
    // Let the effect re-fetch when status/priority change. If they were already empty, need manual fetch.
    if (!status && !priority && page === 1) {
      // Just fetch again
      fetchStaffTickets({ page: 1, limit: 10, search: '' })
        .then(res => { setTickets(res.data); setMeta(res.meta); })
        .catch(err => setError(err.message));
    }
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'New': return 'var(--primary)';
      case 'In Progress': return 'var(--warning)';
      case 'Resolved': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'High': return 'var(--error)';
      case 'Medium': return 'var(--warning)';
      case 'Low': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>IT Ticket Queue</h2>

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: 'var(--error)', padding: '1rem', borderRadius: '6px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 300px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search Ticket # or Summary" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" aria-label="Search"><Search size={18} /></button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
          <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select className="form-select" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button type="button" className="btn-secondary" onClick={clearFilters}>Clear</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading queue...</div>
      ) : tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
          No tickets found matching your criteria.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <table className="desktop-table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--surface)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <thead style={{ backgroundColor: 'var(--pale-green)', borderBottom: '2px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Ticket #</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Summary</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Requester</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>IT Priority</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Owner</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr 
                  key={t.id} 
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => navigate(`/staff/tickets/${t.id}`)}
                  className="queue-row"
                >
                  <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--primary)' }}>{t.ticketNumber}</td>
                  <td style={{ padding: '1rem' }}>{t.summary.length > 40 ? t.summary.substring(0, 40) + '...' : t.summary}</td>
                  <td style={{ padding: '1rem' }}>{t.requester?.name || 'Unknown'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'var(--background)', color: getPriorityColor(t.itPriority) }}>
                      {t.itPriority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, border: `1px solid ${getStatusColor(t.status)}`, color: getStatusColor(t.status) }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{t.owner?.name || 'Unassigned'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="mobile-cards">
            {tickets.map(t => (
              <div key={t.id} className="mobile-card" onClick={() => navigate(`/staff/tickets/${t.id}`)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--primary)' }}>{t.ticketNumber}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>{t.summary}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>Req: {t.requester?.name || 'Unknown'}</span>
                  <span>Own: {t.owner?.name || 'Unassigned'}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, border: `1px solid ${getStatusColor(t.status)}`, color: getStatusColor(t.status) }}>
                    {t.status}
                  </span>
                  <span style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'var(--background)', color: getPriorityColor(t.itPriority) }}>
                    {t.itPriority}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={18} /> Prev
              </button>
              <span style={{ fontWeight: 500 }}>Page {page} of {meta.totalPages}</span>
              <button 
                type="button" 
                className="btn-secondary" 
                disabled={page >= meta.totalPages} 
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center' }}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Row Hover Style Hack since we can't easily add CSS for hover without styled-components */}
      <style>{`
        .queue-row:hover { background-color: var(--pale-green); }
        .mobile-card:hover { border-color: var(--primary); }
      `}</style>
    </div>
  );
};

export default StaffTicketQueue;
