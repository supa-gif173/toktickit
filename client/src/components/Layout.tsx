import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';

const Layout: React.FC = () => {
  const { activeRequester, setActiveRequester } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setActiveRequester(null);
    navigate('/login');
  };

  if (!activeRequester) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem 0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>TokTickIT</h1>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <Link 
                to="/" 
                style={{ 
                  color: location.pathname === '/' ? 'white' : 'rgba(255,255,255,0.7)', 
                  display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 
                }}
              >
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link 
                to="/tickets/new" 
                style={{ 
                  color: location.pathname === '/tickets/new' ? 'white' : 'rgba(255,255,255,0.7)', 
                  display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 
                }}
              >
                <PlusCircle size={18} /> New Ticket
              </Link>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', textAlign: 'right' }}>
              <div><strong>{activeRequester.name}</strong></div>
              <div style={{ color: 'rgba(255,255,255,0.8)' }}>{activeRequester.department}</div>
            </div>
            <button 
              onClick={handleLogout}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                color: 'white', 
                border: 'none', 
                padding: '0.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem' 
              }}
              title="Switch Requester"
            >
              <LogOut size={16} /> Switch
            </button>
          </div>
        </div>
      </header>
      
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <Outlet />
      </main>
      
      <footer style={{ backgroundColor: 'var(--surface)', padding: '1.5rem 0', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        <div className="container">
          &copy; {new Date().getFullYear()} TokTickIT Ticket Management System
        </div>
      </footer>
    </div>
  );
};

export default Layout;
