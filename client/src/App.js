import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import RequesterSelection from './pages/RequesterSelection';
import MyTickets from './pages/MyTickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const { activeRequester, isLoading } = useAuth();
    if (isLoading)
        return _jsx("div", { style: { padding: '2rem', textAlign: 'center' }, children: "Loading session..." });
    if (!activeRequester)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(_Fragment, { children: children });
};
const App = () => {
    return (_jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(RequesterSelection, {}) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(Layout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(MyTickets, {}) }), _jsx(Route, { path: "tickets/new", element: _jsx(CreateTicket, {}) }), _jsx(Route, { path: "tickets/:id", element: _jsx(TicketDetail, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }));
};
export default App;
