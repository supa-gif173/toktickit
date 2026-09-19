import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

const Layout: React.FC = () => {
  const { activeUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!activeUser) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ChangePasswordModal />
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
              {activeUser.role === 'REQUESTER' && (
                <>
                  <Link 
                    to="/tickets" 
                    style={{ 
                      color: location.pathname === '/tickets' ? 'white' : 'rgba(255,255,255,0.7)', 
                      display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 
                    }}
                  >
                    My Tickets
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
                </>
              )}
              {(activeUser.role === 'STAFF' || activeUser.role === 'ADMIN') && (
                <Link 
                  to="/staff/tickets" 
                  style={{ 
                    color: location.pathname.startsWith('/staff/tickets') ? 'white' : 'rgba(255,255,255,0.7)', 
                    display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 
                  }}
                >
                  IT Ticket Queue
                </Link>
              )}
              {activeUser.role === 'ADMIN' && (
                <Link 
                  to="/admin/users" 
                  style={{ 
                    color: location.pathname.startsWith('/admin/users') ? 'white' : 'rgba(255,255,255,0.7)', 
                    display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 
                  }}
                >
                  Manage Users
                </Link>
              )}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', textAlign: 'right' }}>
              <div><strong>{activeUser.name}</strong></div>
              <div style={{ display: 'inline-block', backgroundColor: 'var(--accent)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.2rem' }}>
                {activeUser.role}
              </div>
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
                gap: '0.4rem',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
              title="Log Out"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>
      
      <main style={{ flex: 1, padding: '2rem 0', filter: activeUser.requiresPasswordChange ? 'blur(4px)' : 'none', pointerEvents: activeUser.requiresPasswordChange ? 'none' : 'auto' }}>
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
