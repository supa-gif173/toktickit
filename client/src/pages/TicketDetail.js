import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTicketDetails, API_URL } from '../api';
import { ArrowLeft, AlertCircle, Download, Paperclip } from 'lucide-react';
const TicketDetail = () => {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        if (!id)
            return;
        fetchTicketDetails(id)
            .then(data => setTicket(data))
            .catch(err => setError(err.message || 'Failed to load ticket details.'))
            .finally(() => setLoading(false));
    }, [id]);
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
                padding: '0.3rem 0.8rem', borderRadius: '9999px',
                fontSize: '0.9rem', fontWeight: 600
            }, children: status }));
    };
    const handleDownload = (attachmentId) => {
        // We cannot just use a generic href because we need the X-Requester-Id header for auth.
        // However, fetch with blob is possible.
        const stored = localStorage.getItem('toktickit_requester');
        let requesterId = '';
        if (stored) {
            try {
                requesterId = JSON.parse(stored).id;
            }
            catch (e) { }
        }
        fetch(`${API_URL}/api/attachments/${attachmentId}?download=true`, {
            headers: { 'X-Requester-Id': requesterId }
        })
            .then(res => {
            if (!res.ok)
                throw new Error('Failed to download');
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
            window.URL.revokeObjectURL(url);
        })
            .catch(() => alert('Failed to download file.'));
    };
    if (loading)
        return _jsx("div", { className: "container", style: { padding: '3rem', textAlign: 'center' }, children: "Loading ticket..." });
    if (error)
        return (_jsxs("div", { className: "container", style: { marginTop: '2rem' }, children: [_jsxs("div", { style: { backgroundColor: '#FEE2E2', color: 'var(--error)', padding: '1.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx(AlertCircle, { size: 24 }), " ", error] }), _jsx(Link, { to: "/", style: { display: 'inline-block', marginTop: '1rem', fontWeight: 500 }, children: "\u2190 Back to Dashboard" })] }));
    if (!ticket)
        return null;
    return (_jsxs("div", { className: "container", style: { maxWidth: '900px' }, children: [_jsxs(Link, { to: "/", style: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }, children: [_jsx(ArrowLeft, { size: 16 }), " Back to My Tickets"] }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '2rem' }, children: [_jsxs("div", { style: { flex: '1 1 500px', backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }, children: [_jsx("h2", { style: { margin: 0, fontSize: '1.8rem' }, children: ticket.summary }), renderStatusBadge(ticket.status)] }), _jsxs("div", { style: { marginBottom: '2rem' }, children: [_jsx("div", { className: "form-label", children: "Description" }), _jsx("div", { style: { whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: 1.6 }, children: ticket.description })] })] }), _jsxs("div", { style: { flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }, children: [_jsxs("div", { style: { backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }, children: [_jsx("h3", { style: { margin: '0 0 1rem 0', fontSize: '1.1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }, children: "Ticket Details" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }, children: [_jsxs("div", { children: [_jsx("div", { className: "form-label", style: { fontSize: '0.85rem' }, children: "Ticket Number" }), _jsx("div", { style: { fontWeight: 500 }, children: ticket.ticketNumber })] }), _jsxs("div", { children: [_jsx("div", { className: "form-label", style: { fontSize: '0.85rem' }, children: "Date Created" }), _jsx("div", { style: { fontWeight: 500 }, children: new Date(ticket.createdAt).toLocaleString() })] }), _jsxs("div", { children: [_jsx("div", { className: "form-label", style: { fontSize: '0.85rem' }, children: "Category" }), _jsx("div", { style: { fontWeight: 500 }, children: ticket.category?.name || 'Unknown' })] }), _jsxs("div", { children: [_jsx("div", { className: "form-label", style: { fontSize: '0.85rem' }, children: "Related System" }), _jsx("div", { style: { fontWeight: 500 }, children: ticket.system?.name || 'Unknown' })] })] })] }), _jsxs("div", { style: { backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }, children: [_jsxs("h3", { style: { margin: '0 0 1rem 0', fontSize: '1.1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx(Paperclip, { size: 18 }), " Attachments"] }), !ticket.attachments || ticket.attachments.length === 0 ? (_jsx("div", { style: { color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }, children: "No active attachments." })) : (_jsx("ul", { style: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }, children: ticket.attachments.map(a => (_jsxs("li", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', backgroundColor: 'var(--pale-green)', borderRadius: '6px' }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column' }, children: [_jsx("span", { style: { fontSize: '0.9rem', fontWeight: 500, wordBreak: 'break-all' }, children: a.fileName }), _jsxs("span", { style: { fontSize: '0.75rem', color: 'var(--text-secondary)' }, children: [(a.fileSize / 1024).toFixed(1), " KB"] })] }), _jsxs("button", { onClick: () => handleDownload(a.id), className: "btn-secondary", style: { padding: '0.3rem 0.6rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }, "aria-label": `Download ${a.fileName}`, children: [_jsx(Download, { size: 14 }), " Download"] })] }, a.id))) }))] })] })] })] }));
};
export default TicketDetail;
