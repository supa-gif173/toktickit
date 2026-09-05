import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTickets, fetchCategories } from '../api';
import { Search, Filter, AlertCircle, PlusCircle } from 'lucide-react';
const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, totalCount: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Filters
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [ticketsData, categoriesData] = await Promise.all([
                fetchTickets({ page, search, category, status }),
                fetchCategories().catch(() => []) // ok to fail silently
            ]);
            setTickets(ticketsData.data);
            setMeta(ticketsData.meta);
            if (categories.length === 0)
                setCategories(categoriesData);
        }
        catch (err) {
            setError(err.message || 'Failed to load tickets.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, category, status]);
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        loadData();
    };
    const clearFilters = () => {
        setSearch('');
        setCategory('');
        setStatus('');
        setPage(1);
    };
    const renderStatusBadge = (status) => {
        let bg = '#E5E7EB';
        let color = '#374151';
        if (status === 'New') {
            bg = '#EAF6EF';
            color = 'var(--primary)';
        }
        else if (status === 'In Progress') {
            bg = '#FEF3C7';
            color = '#B45309';
        }
        else if (status === 'Resolved') {
            bg = '#D1FAE5';
            color = '#065F46';
        }
        return (_jsx("span", { style: {
                backgroundColor: bg, color,
                padding: '0.2rem 0.6rem', borderRadius: '9999px',
                fontSize: '0.85rem', fontWeight: 600
            }, children: status }));
    };
    return (_jsxs("div", { className: "container", children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }, children: [_jsx("h2", { style: { margin: 0 }, children: "My Tickets" }), _jsxs(Link, { to: "/tickets/new", className: "btn-primary", style: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }, children: [_jsx(PlusCircle, { size: 18 }), " Create Ticket"] })] }), _jsx("div", { style: { backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }, children: _jsxs("form", { onSubmit: handleSearchSubmit, style: { display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }, children: [_jsxs("div", { style: { flex: '1 1 250px' }, className: "form-group", children: [_jsxs("label", { className: "form-label", htmlFor: "search", children: [_jsx(Search, { size: 14, style: { marginRight: '0.4rem' } }), "Search Summary"] }), _jsx("input", { id: "search", type: "text", className: "form-input", placeholder: "Search...", value: search, onChange: e => setSearch(e.target.value), style: { marginBottom: 0 } })] }), _jsxs("div", { style: { flex: '1 1 150px' }, className: "form-group", children: [_jsxs("label", { className: "form-label", htmlFor: "category", children: [_jsx(Filter, { size: 14, style: { marginRight: '0.4rem' } }), "Category"] }), _jsxs("select", { id: "category", className: "form-select", value: category, onChange: e => { setCategory(e.target.value); setPage(1); }, style: { marginBottom: 0 }, children: [_jsx("option", { value: "", children: "All Categories" }), categories.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] })] }), _jsxs("div", { style: { flex: '1 1 150px' }, className: "form-group", children: [_jsxs("label", { className: "form-label", htmlFor: "status", children: [_jsx(Filter, { size: 14, style: { marginRight: '0.4rem' } }), "Status"] }), _jsxs("select", { id: "status", className: "form-select", value: status, onChange: e => { setStatus(e.target.value); setPage(1); }, style: { marginBottom: 0 }, children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "New", children: "New" }), _jsx("option", { value: "In Progress", children: "In Progress" }), _jsx("option", { value: "Resolved", children: "Resolved" })] })] }), _jsx("button", { type: "submit", className: "btn-secondary", style: { marginBottom: '1.2rem' }, children: "Search" })] }) }), error && (_jsxs("div", { style: { backgroundColor: '#FEE2E2', color: 'var(--error)', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx(AlertCircle, { size: 20 }), " ", error] })), loading ? (_jsx("div", { style: { textAlign: 'center', padding: '3rem' }, children: "Loading tickets..." })) : tickets.length === 0 ? (_jsxs("div", { style: { textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }, children: [_jsx("div", { style: { color: 'var(--text-secondary)', marginBottom: '1rem' }, children: _jsx(Search, { size: 48, style: { opacity: 0.5 } }) }), _jsx("h3", { style: { margin: '0 0 0.5rem 0' }, children: "No tickets found" }), _jsx("p", { style: { color: 'var(--text-secondary)', marginBottom: '1.5rem' }, children: search || category || status ? "No tickets match your current filters." : "You haven't created any tickets yet." }), (search || category || status) ? (_jsx("button", { onClick: clearFilters, className: "btn-secondary", children: "Clear Filters" })) : (_jsx(Link, { to: "/tickets/new", className: "btn-primary", children: "Create your first ticket" }))] })) : (_jsxs(_Fragment, { children: [_jsx("div", { style: { overflowX: 'auto', backgroundColor: 'var(--surface)', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { borderBottom: '2px solid var(--border)', backgroundColor: '#F9FAFB' }, children: [_jsx("th", { style: { padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }, children: "Ticket #" }), _jsx("th", { style: { padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }, children: "Summary" }), _jsx("th", { style: { padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }, children: "Date Created" }), _jsx("th", { style: { padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }, children: "Status" })] }) }), _jsx("tbody", { children: tickets.map(ticket => (_jsxs("tr", { style: { borderBottom: '1px solid var(--border)' }, children: [_jsx("td", { style: { padding: '1rem' }, children: _jsx(Link, { to: `/tickets/${ticket.id}`, style: { fontWeight: 500 }, children: ticket.ticketNumber }) }), _jsx("td", { style: { padding: '1rem' }, children: ticket.summary }), _jsx("td", { style: { padding: '1rem', color: 'var(--text-secondary)' }, children: new Date(ticket.createdAt).toLocaleDateString() }), _jsx("td", { style: { padding: '1rem' }, children: renderStatusBadge(ticket.status) })] }, ticket.id))) })] }) }), meta.totalPages > 1 && (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }, children: [_jsxs("div", { style: { color: 'var(--text-secondary)', fontSize: '0.9rem' }, children: ["Showing ", ((meta.page - 1) * meta.limit) + 1, " to ", Math.min(meta.page * meta.limit, meta.totalCount), " of ", meta.totalCount, " tickets"] }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem' }, children: [_jsx("button", { className: "btn-secondary", disabled: page === 1, onClick: () => setPage(p => Math.max(1, p - 1)), style: { padding: '0.4rem 0.8rem' }, children: "Previous" }), _jsx("button", { className: "btn-secondary", disabled: page === meta.totalPages, onClick: () => setPage(p => Math.min(meta.totalPages, p + 1)), style: { padding: '0.4rem 0.8rem' }, children: "Next" })] })] }))] }))] }));
};
export default MyTickets;
