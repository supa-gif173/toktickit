import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchRequesters, Requester } from '../api';

const RequesterSelection: React.FC = () => {
  const { setActiveRequester } = useAuth();
  const navigate = useNavigate();
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    fetchRequesters()
      .then(data => {
        setRequesters(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (e: React.FormEvent) => {
    e.preventDefault();
    const req = requesters.find(r => r.id === selectedId);
    if (req) {
      setActiveRequester(req);
      navigate('/');
    }
  };

  if (loading) return <div className="container" style={{ marginTop: '2rem' }}>Loading mock requesters...</div>;
  if (error) return <div className="container text-error" style={{ marginTop: '2rem' }}>Error: {error}</div>;

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '4rem' }}>
      <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }}>Development Access</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Select a mock Requester profile to begin your session.
        </p>
        
        <form onSubmit={handleSelect}>
          <div className="form-group">
            <label className="form-label" htmlFor="requester-select">Active Requester</label>
            <select 
              id="requester-select"
              className="form-select" 
              value={selectedId} 
              onChange={e => setSelectedId(e.target.value)}
            >
              {requesters.map(req => (
                <option key={req.id} value={req.id}>
                  {req.name} ({req.department})
                </option>
              ))}
            </select>
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequesterSelection;
