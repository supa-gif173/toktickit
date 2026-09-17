import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import MyTickets from './pages/MyTickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';

const ProtectedRoute = ({ children, requireRole }: { children: React.ReactNode, requireRole?: 'REQUESTER' | 'STAFF' | 'ADMIN' }) => {
  const { activeUser, isLoading } = useAuth();
  
  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading session...</div>;
  if (!activeUser) return <Navigate to="/login" replace />;
  if (requireRole && activeUser.role !== requireRole) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<MyTickets />} />
            <Route path="tickets/new" element={
              <ProtectedRoute requireRole="REQUESTER">
                <CreateTicket />
              </ProtectedRoute>
            } />
            <Route path="tickets/:id" element={<TicketDetail />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
