import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';
const Layout = () => {
    const { activeRequester, setActiveRequester } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const handleLogout = () => {
        setActiveRequester(null);
        navigate('/login');
    };
    if (!activeRequester)
        return null;
    return (_jsxs("div", { style: { minHeight: '100vh', display: 'flex', flexDirection: 'column' }, children: [_jsx("header", { style: { backgroundColor: 'var(--primary)', color: 'white', padding: '1rem 0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }, children: _jsxs("div", { className: "container", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '2rem' }, children: [_jsx("h1", { style: { margin: 0, fontSize: '1.5rem', fontWeight: 600 }, children: "TokTickIT" }), _jsxs("nav", { style: { display: 'flex', gap: '1rem' }, children: [_jsxs(Link, { to: "/", style: {
                                                color: location.pathname === '/' ? 'white' : 'rgba(255,255,255,0.7)',
                                                display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500
                                            }, children: [_jsx(LayoutDashboard, { size: 18 }), " Dashboard"] }), _jsxs(Link, { to: "/tickets/new", style: {
                                                color: location.pathname === '/tickets/new' ? 'white' : 'rgba(255,255,255,0.7)',
                                                display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500
                                            }, children: [_jsx(PlusCircle, { size: 18 }), " New Ticket"] })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem' }, children: [_jsxs("div", { style: { fontSize: '0.9rem', textAlign: 'right' }, children: [_jsx("div", { children: _jsx("strong", { children: activeRequester.name }) }), _jsx("div", { style: { color: 'rgba(255,255,255,0.8)' }, children: activeRequester.department })] }), _jsxs("button", { onClick: handleLogout, style: {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem'
                                    }, title: "Switch Requester", children: [_jsx(LogOut, { size: 16 }), " Switch"] })] })] }) }), _jsx("main", { style: { flex: 1, padding: '2rem 0' }, children: _jsx(Outlet, {}) }), _jsx("footer", { style: { backgroundColor: 'var(--surface)', padding: '1.5rem 0', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }, children: _jsxs("div", { className: "container", children: ["\u00A9 ", new Date().getFullYear(), " TokTickIT Ticket Management System"] }) })] }));
};
export default Layout;
