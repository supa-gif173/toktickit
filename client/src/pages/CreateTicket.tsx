import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, fetchSystems, createTicket, uploadAttachment, removeAttachment, Category, RelatedSystem, Attachment } from '../api';
import { UploadCloud, X, AlertCircle } from 'lucide-react';

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [systems, setSystems] = useState<RelatedSystem[]>([]);
  
  // Form State
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [systemId, setSystemId] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchSystems()])
      .then(([cats, sys]) => {
        setCategories(cats);
        setSystems(sys);
      })
      .catch(() => setError('Failed to load lookup data.'));
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setError('');
    const newFiles = Array.from(files);
    
    if (attachments.length + newFiles.length > 5) {
      setError('Maximum 5 files allowed per ticket.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    const validFiles = newFiles.filter(f => {
      if (f.size > 5 * 1024 * 1024) {
        setError(`File ${f.name} exceeds 5MB limit.`);
        return false;
      }
      const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
      if (!allowedTypes.includes(f.type) && !allowedExts.includes(ext)) {
        setError(`File ${f.name} is not a valid type (JPG, PNG, WEBP, PDF).`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(validFiles.map(file => uploadAttachment(file)));
      setAttachments(prev => [...prev, ...uploaded]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload one or more files.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = async (id: string) => {
    try {
      await removeAttachment(id);
      setAttachments(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to remove attachment.');
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!summary.trim()) errors.summary = 'Summary is required.';
    if (!description.trim()) errors.description = 'Description is required.';
    if (!categoryId) errors.categoryId = 'Category is required.';
    if (!systemId) errors.systemId = 'System is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

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
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket.');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '2rem' }}>Create New Ticket</h2>
      
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: 'var(--error)', padding: '1rem', borderRadius: '6px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        
        {/* System Generated Info */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="form-label" style={{ fontSize: '0.85rem' }}>Ticket Number</div>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>[Generated on Submit]</div>
          </div>
          <div>
            <div className="form-label" style={{ fontSize: '0.85rem' }}>Status</div>
            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>New</div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="summary">Summary<span className="required">*</span></label>
          <input 
            id="summary" type="text" 
            className={`form-input ${fieldErrors.summary ? 'error' : ''}`}
            value={summary} onChange={e => setSummary(e.target.value)} 
            placeholder="Brief description of the issue"
            maxLength={100}
          />
          {fieldErrors.summary && <div className="form-error-msg">{fieldErrors.summary}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">Description<span className="required">*</span></label>
          <textarea 
            id="description" rows={5}
            className={`form-textarea ${fieldErrors.description ? 'error' : ''}`}
            value={description} onChange={e => setDescription(e.target.value)} 
            placeholder="Detailed explanation..."
          />
          {fieldErrors.description && <div className="form-error-msg">{fieldErrors.description}</div>}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" htmlFor="category">Category<span className="required">*</span></label>
            <select 
              id="category" className={`form-select ${fieldErrors.categoryId ? 'error' : ''}`}
              value={categoryId} onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">Select...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {fieldErrors.categoryId && <div className="form-error-msg">{fieldErrors.categoryId}</div>}
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" htmlFor="system">Related System<span className="required">*</span></label>
            <select 
              id="system" className={`form-select ${fieldErrors.systemId ? 'error' : ''}`}
              value={systemId} onChange={e => setSystemId(e.target.value)}
            >
              <option value="">Select...</option>
              {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {fieldErrors.systemId && <div className="form-error-msg">{fieldErrors.systemId}</div>}
          </div>
        </div>

        {/* Dropzone */}
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Attachments (Max 5 files, 5MB each)</label>
          <div 
            role="button"
            tabIndex={0}
            style={{ 
              border: '2px dashed var(--border)', borderRadius: '8px', padding: '2rem', 
              textAlign: 'center', backgroundColor: '#F9FAFB', cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files);
            }}
          >
            <UploadCloud size={32} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }} />
            <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Click or drag files to upload</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>JPG, PNG, WEBP, PDF only</div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              multiple 
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={e => handleFileUpload(e.target.files)}
            />
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--primary)' }}>
                Uploading...
              </div>
            )}
          </div>
        </div>

        {/* Attachment List */}
        {attachments.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
            {attachments.map(a => (
              <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', backgroundColor: 'var(--pale-green)', borderRadius: '6px', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{a.fileName}</span>
                <button type="button" onClick={() => handleRemoveAttachment(a.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.2rem' }} aria-label="Remove attachment">
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading || uploading}>
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;
