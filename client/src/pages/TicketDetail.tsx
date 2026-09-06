import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTicketDetails, Ticket, API_URL } from '../api';
import { ArrowLeft, AlertCircle, Download, Paperclip } from 'lucide-react';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchTicketDetails(id)
      .then(data => setTicket(data))
      .catch(err => setError(err.message || 'Failed to load ticket details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const renderStatusBadge = (status: string) => {
    let bg = '#E5E7EB';
    let color = '#374151';
    if (status === 'New') { bg = '#EAF6EF'; color = 'var(--primary)'; }
    else if (status === 'In Progress') { bg = '#FEF3C7'; color = '#B45309'; }
    else if (status === 'Resolved') { bg = '#D1FAE5'; color = '#065F46'; }
    
    return (
      <span style={{ 
        backgroundColor: bg, color, 
        padding: '0.3rem 0.8rem', borderRadius: '9999px', 
        fontSize: '0.9rem', fontWeight: 600 
      }}>
        {status}
      </span>
    );
  };

  const handleDownload = (attachmentId: string) => {
    // We cannot just use a generic href because we need the X-Requester-Id header for auth.
    // However, fetch with blob is possible.
    const stored = localStorage.getItem('toktickit_requester');
    let requesterId = '';
    if (stored) {
      try { requesterId = JSON.parse(stored).id; } catch (e) {}
    }

    fetch(`${API_URL}/api/attachments/${attachmentId}?download=true`, {
      headers: { 'X-Requester-Id': requesterId }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to download');
      const filename = res.headers.get('Content-Disposition')?.split('filename="')[1]?.split('"')[0] || 'download';
      return res.blob().then(blob => ({ blob, filename }));
    })
    .then(({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    })
    .catch(() => alert('Failed to download file.'));
  };

  if (loading) return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>Loading ticket...</div>;
  if (error) return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div style={{ backgroundColor: '#FEE2E2', color: 'var(--error)', padding: '1.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertCircle size={24} /> {error}
      </div>
      <Link to="/" style={{ display: 'inline-block', marginTop: '1rem', fontWeight: 500 }}>&larr; Back to Dashboard</Link>
    </div>
  );
  if (!ticket) return null;

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to My Tickets
      </Link>
      
      <div className="form-grid">
        {/* Main Details (Left Col) */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{ticket.summary}</h2>
            {renderStatusBadge(ticket.status)}
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <div className="form-label">Description</div>
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: 1.6, wordBreak: 'break-word' }}>
              {ticket.description}
            </div>
          </div>
        </div>

        {/* Metadata & Attachments (Right Col) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Ticket Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <div className="form-label" style={{ fontSize: '0.85rem' }}>Ticket Number</div>
                <div style={{ fontWeight: 500 }}>{ticket.ticketNumber}</div>
              </div>
              <div>
                <div className="form-label" style={{ fontSize: '0.85rem' }}>Date Created</div>
                <div style={{ fontWeight: 500 }}>{new Date(ticket.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="form-label" style={{ fontSize: '0.85rem' }}>Category</div>
                <div style={{ fontWeight: 500 }}>{ticket.category?.name || 'Unknown'}</div>
              </div>
              <div>
                <div className="form-label" style={{ fontSize: '0.85rem' }}>Related System</div>
                <div style={{ fontWeight: 500 }}>{ticket.system?.name || 'Unknown'}</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Paperclip size={18} /> Attachments
            </h3>
            
            {!ticket.attachments || ticket.attachments.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No active attachments.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ticket.attachments.map(a => (
                  <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', backgroundColor: 'var(--pale-green)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, wordBreak: 'break-all' }}>{a.fileName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{(a.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <button 
                      onClick={() => handleDownload(a.id)}
                      className="btn-secondary" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      aria-label={`Download ${a.fileName}`}
                    >
                      <Download size={14} /> Download
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
