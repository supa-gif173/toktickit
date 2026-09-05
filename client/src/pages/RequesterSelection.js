import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchRequesters } from '../api';
const RequesterSelection = () => {
    const { setActiveRequester } = useAuth();
    const navigate = useNavigate();
    const [requesters, setRequesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState('');
    useEffect(() => {
        fetchRequesters()
            .then(data => {
            setRequesters(data);
            if (data.length > 0)
                setSelectedId(data[0].id);
        })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);
    const handleSelect = (e) => {
        e.preventDefault();
        const req = requesters.find(r => r.id === selectedId);
        if (req) {
            setActiveRequester(req);
            navigate('/');
        }
    };
    if (loading)
        return _jsx("div", { className: "container", style: { marginTop: '2rem' }, children: "Loading mock requesters..." });
    if (error)
        return _jsxs("div", { className: "container text-error", style: { marginTop: '2rem' }, children: ["Error: ", error] });
    return (_jsx("div", { className: "container", style: { maxWidth: '500px', marginTop: '4rem' }, children: _jsxs("div", { style: { backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }, children: [_jsx("h2", { style: { textAlign: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }, children: "Development Access" }), _jsx("p", { style: { textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }, children: "Select a mock Requester profile to begin your session." }), _jsxs("form", { onSubmit: handleSelect, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "requester-select", children: "Active Requester" }), _jsx("select", { id: "requester-select", className: "form-select", value: selectedId, onChange: e => setSelectedId(e.target.value), children: requesters.map(req => (_jsxs("option", { value: req.id, children: [req.name, " (", req.department, ")"] }, req.id))) })] }), _jsx("button", { type: "submit", className: "btn-primary", style: { width: '100%', marginTop: '1rem' }, children: "Continue" })] })] }) }));
};
export default RequesterSelection;
