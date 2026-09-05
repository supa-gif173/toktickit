import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, fetchSystems, createTicket, uploadAttachment, removeAttachment } from '../api';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
const CreateTicket = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [systems, setSystems] = useState([]);
    // Form State
    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [systemId, setSystemId] = useState('');
    const [attachments, setAttachments] = useState([]);
    // UI State
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const fileInputRef = useRef(null);
    useEffect(() => {
        Promise.all([fetchCategories(), fetchSystems()])
            .then(([cats, sys]) => {
            setCategories(cats);
            setSystems(sys);
        })
            .catch(() => setError('Failed to load lookup data.'));
    }, []);
    const handleFileUpload = async (files) => {
        if (!files || files.length === 0)
            return;
        setError('');
        const newFiles = Array.from(files);
        if (attachments.length + newFiles.length > 5) {
            setError('Maximum 5 files allowed per ticket.');
            return;
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        const validFiles = newFiles.filter(f => {
            if (f.size > 5 * 1024 * 1024) {
                setError(`File ${f.name} exceeds 5MB limit.`);
                return false;
            }
            if (!allowedTypes.includes(f.type)) {
                setError(`File ${f.name} is not a valid type (JPG, PNG, WEBP, PDF).`);
                return false;
            }
            return true;
        });
        if (validFiles.length === 0)
            return;
        setUploading(true);
        try {
            const uploaded = await Promise.all(validFiles.map(file => uploadAttachment(file)));
            setAttachments(prev => [...prev, ...uploaded]);
        }
        catch (err) {
            setError(err.message || 'Failed to upload one or more files.');
        }
        finally {
            setUploading(false);
            if (fileInputRef.current)
                fileInputRef.current.value = '';
        }
    };
    const handleRemoveAttachment = async (id) => {
        try {
            await removeAttachment(id);
            setAttachments(prev => prev.filter(a => a.id !== id));
        }
        catch (err) {
            setError(err.message || 'Failed to remove attachment.');
        }
    };
    const validateForm = () => {
        const errors = {};
        if (!summary.trim())
            errors.summary = 'Summary is required.';
        if (!description.trim())
            errors.description = 'Description is required.';
        if (!categoryId)
            errors.categoryId = 'Category is required.';
        if (!systemId)
            errors.systemId = 'System is required.';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        setLoading(true);
        setError('');
        try {
            const ticket = await createTicket({
                summary,
                description,
                categoryId,
                systemId,
                attachments: attachments.map(a => a.id)
            });
            navigate(`/tickets/${ticket.id}`);
        }
        catch (err) {
            setError(err.message || 'Failed to create ticket.');
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "container", style: { maxWidth: '800px' }, children: [_jsx("h2", { style: { marginBottom: '2rem' }, children: "Create New Ticket" }), error && (_jsxs("div", { style: { backgroundColor: '#FEE2E2', color: 'var(--error)', padding: '1rem', borderRadius: '6px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx(AlertCircle, { size: 20 }), " ", error] })), _jsxs("form", { onSubmit: handleSubmit, style: { backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }, children: [_jsxs("div", { style: { display: 'flex', gap: '2rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }, children: [_jsxs("div", { children: [_jsx("div", { className: "form-label", style: { fontSize: '0.85rem' }, children: "Ticket Number" }), _jsx("div", { style: { fontWeight: 600, color: 'var(--text-secondary)' }, children: "[Generated on Submit]" })] }), _jsxs("div", { children: [_jsx("div", { className: "form-label", style: { fontSize: '0.85rem' }, children: "Status" }), _jsx("div", { style: { fontWeight: 600, color: 'var(--primary)' }, children: "New" })] })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", htmlFor: "summary", children: ["Summary", _jsx("span", { className: "required", children: "*" })] }), _jsx("input", { id: "summary", type: "text", className: `form-input ${fieldErrors.summary ? 'error' : ''}`, value: summary, onChange: e => setSummary(e.target.value), placeholder: "Brief description of the issue", maxLength: 100 }), fieldErrors.summary && _jsx("div", { className: "form-error-msg", children: fieldErrors.summary })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", htmlFor: "description", children: ["Description", _jsx("span", { className: "required", children: "*" })] }), _jsx("textarea", { id: "description", rows: 5, className: `form-textarea ${fieldErrors.description ? 'error' : ''}`, value: description, onChange: e => setDescription(e.target.value), placeholder: "Detailed explanation..." }), fieldErrors.description && _jsx("div", { className: "form-error-msg", children: fieldErrors.description })] }), _jsxs("div", { style: { display: 'flex', gap: '1rem', flexWrap: 'wrap' }, children: [_jsxs("div", { className: "form-group", style: { flex: 1 }, children: [_jsxs("label", { className: "form-label", htmlFor: "category", children: ["Category", _jsx("span", { className: "required", children: "*" })] }), _jsxs("select", { id: "category", className: `form-select ${fieldErrors.categoryId ? 'error' : ''}`, value: categoryId, onChange: e => setCategoryId(e.target.value), children: [_jsx("option", { value: "", children: "Select..." }), categories.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] }), fieldErrors.categoryId && _jsx("div", { className: "form-error-msg", children: fieldErrors.categoryId })] }), _jsxs("div", { className: "form-group", style: { flex: 1 }, children: [_jsxs("label", { className: "form-label", htmlFor: "system", children: ["Related System", _jsx("span", { className: "required", children: "*" })] }), _jsxs("select", { id: "system", className: `form-select ${fieldErrors.systemId ? 'error' : ''}`, value: systemId, onChange: e => setSystemId(e.target.value), children: [_jsx("option", { value: "", children: "Select..." }), systems.map(s => _jsx("option", { value: s.id, children: s.name }, s.id))] }), fieldErrors.systemId && _jsx("div", { className: "form-error-msg", children: fieldErrors.systemId })] })] }), _jsxs("div", { className: "form-group", style: { marginTop: '1rem' }, children: [_jsx("label", { className: "form-label", children: "Attachments (Max 5 files, 5MB each)" }), _jsxs("div", { style: {
                                    border: '2px dashed var(--border)', borderRadius: '8px', padding: '2rem',
                                    textAlign: 'center', backgroundColor: '#F9FAFB', cursor: 'pointer',
                                    position: 'relative'
                                }, onClick: () => fileInputRef.current?.click(), children: [_jsx(UploadCloud, { size: 32, style: { color: 'var(--text-secondary)', marginBottom: '0.5rem' } }), _jsx("div", { style: { color: 'var(--text-primary)', fontWeight: 500 }, children: "Click or drag files to upload" }), _jsx("div", { style: { fontSize: '0.85rem', color: 'var(--text-secondary)' }, children: "JPG, PNG, WEBP, PDF only" }), _jsx("input", { type: "file", ref: fileInputRef, style: { display: 'none' }, multiple: true, accept: ".jpg,.jpeg,.png,.webp,.pdf", onChange: e => handleFileUpload(e.target.files) }), uploading && (_jsx("div", { style: { position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--primary)' }, children: "Uploading..." }))] })] }), attachments.length > 0 && (_jsx("ul", { style: { listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }, children: attachments.map(a => (_jsxs("li", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', backgroundColor: 'var(--pale-green)', borderRadius: '6px', marginBottom: '0.5rem' }, children: [_jsx("span", { style: { fontSize: '0.9rem', fontWeight: 500 }, children: a.fileName }), _jsx("button", { type: "button", onClick: () => handleRemoveAttachment(a.id), style: { background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.2rem' }, "aria-label": "Remove attachment", children: _jsx(X, { size: 18 }) })] }, a.id))) })), _jsxs("div", { style: { display: 'flex', gap: '1rem', marginTop: '2rem' }, children: [_jsx("button", { type: "button", className: "btn-secondary", onClick: () => navigate('/'), children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary", disabled: loading || uploading, children: loading ? 'Submitting...' : 'Submit Ticket' })] })] })] }));
};
export default CreateTicket;
