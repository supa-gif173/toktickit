import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTickets, fetchCategories, Ticket, Category } from '../api';
import { Search, Filter, AlertCircle, PlusCircle, ChevronUp, ChevronDown } from 'lucide-react';

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ticketsData, categoriesData] = await Promise.all([
        fetchTickets({ page, search, category, status, sortBy, sortOrder }),
        fetchCategories().catch(() => []) // ok to fail silently
      ]);
      setTickets(ticketsData.data);
      setMeta(ticketsData.meta);
      if (categories.length === 0) setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, status, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setPage(1);
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const renderSortHeader = (field: string, label: string) => {
    return (
      <th 
        style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
        onClick={() => handleSort(field)}
        title={`Sort by ${label}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {label}
          {sortBy === field ? (
            sortOrder === 'asc' ? <ChevronUp size={16} color="var(--primary)" /> : <ChevronDown size={16} color="var(--primary)" />
          ) : (
            <ChevronDown size={16} style={{ opacity: 0.2 }} />
          )}
        </div>
      </th>
    );
  };

  const renderStatusBadge = (status: string) => {
    let bg = '#E5E7EB';
    let color = '#374151';
    if (status === 'New') { bg = '#EAF6EF'; color = 'var(--primary)'; }
    else if (status === 'In Progress') { bg = '#FEF3C7'; color = '#B45309'; }
    else if (status === 'Resolved') { bg = '#D1FAE5'; color = '#065F46'; }
    
    return (
      <span style={{ 
        backgroundColor: bg, color, 
        padding: '0.2rem 0.6rem', borderRadius: '9999px', 
        fontSize: '0.85rem', fontWeight: 600 
      }}>
        {status}
      </span>
    );
  };

  return (
    <div className="container">
      <h2 style={{ margin: 0, marginBottom: '2rem' }}>My Tickets</h2>

      <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSearchSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="search"><Search size={14} style={{ marginRight: '0.4rem' }}/>Search Summary</label>
            <input 
              id="search" type="text" className="form-input" 
              placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} 
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="category"><Filter size={14} style={{ marginRight: '0.4rem' }}/>Category</label>
            <select id="category" className="form-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} style={{ marginBottom: 0 }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="status"><Filter size={14} style={{ marginRight: '0.4rem' }}/>Status</label>
            <select id="status" className="form-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ marginBottom: 0 }}>
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-secondary" style={{ height: '42px', marginTop: 'auto' }}>Search</button>
          </div>
        </form>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: 'var(--error)', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <Search size={48} style={{ opacity: 0.5 }} />
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>No tickets found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {search || category || status ? "No tickets match your current filters." : "You haven't created any tickets yet."}
          </p>
          {(search || category || status) ? (
            <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
          ) : (
            <Link to="/tickets/new" className="btn-primary">Create your first ticket</Link>
          )}
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <table className="desktop-table">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: '#F9FAFB' }}>
                  {renderSortHeader('ticketNumber', 'Ticket #')}
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Summary</th>
                  {renderSortHeader('createdAt', 'Date Created')}
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <Link to={`/tickets/${ticket.id}`} style={{ fontWeight: 500 }}>{ticket.ticketNumber}</Link>
                    </td>
                    <td style={{ padding: '1rem' }}>{ticket.summary}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {renderStatusBadge(ticket.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-cards">
            {tickets.map(ticket => (
              <div key={ticket.id} className="mobile-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <Link to={`/tickets/${ticket.id}`} style={{ fontWeight: 500 }}>{ticket.ticketNumber}</Link>
                  {renderStatusBadge(ticket.status)}
                </div>
                <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>{ticket.summary}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.totalCount)} of {meta.totalCount} tickets
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn-secondary" 
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{ padding: '0.4rem 0.8rem' }}
                >
                  Previous
                </button>
                <button 
                  className="btn-secondary" 
                  disabled={page === meta.totalPages} 
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  style={{ padding: '0.4rem 0.8rem' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyTickets;
