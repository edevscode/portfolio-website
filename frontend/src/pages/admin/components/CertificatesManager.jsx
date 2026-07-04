import React, { useState, useEffect, useRef } from 'react'
import { Plus, Award, X, FileText } from 'lucide-react'
import { apiService, API_BASE_URL } from '../../../services/apiService'
import { FormField, ModalForm, Table } from './Form'
import './Manager.css'

const ACCEPT = 'image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function normalizeUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  try {
    return `${new URL(API_BASE_URL).origin}${url.startsWith('/') ? '' : '/'}${url}`
  } catch {
    return url
  }
}

function fileType(urlOrFile) {
  const name = (urlOrFile instanceof File ? urlOrFile.name : (urlOrFile || '')).toLowerCase().split('?')[0]
  if (name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'word'
  return 'image'
}

function FileThumb({ src, file, onRemove }) {
  const type = file ? fileType(file) : fileType(src)
  const url = src ? normalizeUrl(src) : null

  const inner = type === 'image' ? (
    <img
      src={file ? URL.createObjectURL(file) : url}
      alt=""
      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
    />
  ) : (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 8,
      background: type === 'pdf' ? '#fff1f0' : '#eff6ff',
      border: `1.5px solid ${type === 'pdf' ? '#fca5a5' : '#93c5fd'}`,
    }}>
      <FileText size={22} color={type === 'pdf' ? '#dc2626' : '#2563eb'} />
      <span style={{ fontSize: 10, fontWeight: 700, color: type === 'pdf' ? '#dc2626' : '#2563eb', letterSpacing: 0.5 }}>
        {type === 'pdf' ? 'PDF' : 'DOC'}
      </span>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 10, color: type === 'pdf' ? '#dc2626' : '#2563eb', textDecoration: 'underline' }}
          onClick={e => e.stopPropagation()}>
          View
        </a>
      )}
    </div>
  )

  return (
    <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
      {inner}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            position: 'absolute', top: -6, right: -6,
            width: 20, height: 20, borderRadius: '50%',
            background: '#ef4444', border: 'none', cursor: 'pointer',
            display: 'grid', placeItems: 'center', padding: 0,
          }}
        >
          <X size={11} color="#fff" />
        </button>
      )}
    </div>
  )
}

const EMPTY = {
  title: '', issuer: '', description: '',
  issue_date: '', expiry_date: '',
  credential_id: '', credential_url: '',
  order: 0, is_featured: false,
}

export default function CertificatesManager() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY)
  const [existingFiles, setExistingFiles] = useState([])   // {id, file: url, ...}
  const [pendingFiles, setPendingFiles] = useState([])     // {tempId, file: File}
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setLoading(true)
      const res = await apiService.getCertificates()
      setCerts(res.data)
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setFormData({ ...EMPTY, order: certs.length === 0 ? 0 : Math.max(...certs.map(c => c.order)) + 1 })
    setExistingFiles([])
    setPendingFiles([])
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (cert) => {
    setFormData({
      title: cert.title || '',
      issuer: cert.issuer || '',
      description: cert.description || '',
      issue_date: cert.issue_date || '',
      expiry_date: cert.expiry_date || '',
      credential_id: cert.credential_id || '',
      credential_url: cert.credential_url || '',
      order: cert.order ?? 0,
      is_featured: cert.is_featured ?? false,
    })
    setExistingFiles(cert.files || [])
    setPendingFiles([])
    setEditingId(cert.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certificate?')) return
    try {
      await apiService.deleteCertificate(id)
      setCerts(prev => prev.filter(c => c.id !== id))
    } catch {
      alert('Failed to delete certificate.')
    }
  }

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || [])
    const newEntries = files.map((file, i) => ({ tempId: `${Date.now()}-${i}`, file }))
    setPendingFiles(prev => [...prev, ...newEntries])
    e.target.value = ''
  }

  const removePending = (tempId) => setPendingFiles(prev => prev.filter(f => f.tempId !== tempId))

  const removeExisting = async (id) => {
    try {
      await apiService.deleteCertificateFile(id)
      setExistingFiles(prev => prev.filter(f => f.id !== id))
    } catch {
      alert('Failed to remove file.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const targetOrder = formData.order
      const conflicting = certs.filter(c => c.order === targetOrder && c.id !== editingId)
      if (conflicting.length > 0) {
        const maxOrder = Math.max(...certs.map(c => c.order), targetOrder)
        await Promise.all(conflicting.map((c, i) => apiService.updateCertificate(c.id, { order: maxOrder + 1 + i })))
      }
      const fd = new FormData()
      Object.entries(formData).forEach(([k, v]) => {
        if (v === '' || v === null || v === undefined) return
        fd.append(k, typeof v === 'boolean' ? (v ? 'true' : 'false') : v)
      })
      pendingFiles.forEach(({ file }) => fd.append('files', file))

      if (editingId) {
        await apiService.updateCertificate(editingId, fd)
      } else {
        await apiService.createCertificate(fd)
      }
      setShowForm(false)
      load()
    } catch (err) {
      alert('Failed to save. ' + (err?.response?.data ? JSON.stringify(err.response.data) : err.message))
    } finally {
      setSubmitting(false)
    }
  }

  const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }))

  const columns = [
    {
      key: 'files',
      label: '',
      render: (files) => {
        const first = files?.[0]
        if (!first) return (
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'grid', placeItems: 'center' }}>
            <Award size={18} color="#94a3b8" />
          </div>
        )
        const type = first.file_type || fileType(first.file)
        if (type === 'image') return (
          <img src={normalizeUrl(first.file)} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
        )
        return (
          <div style={{ width: 40, height: 40, borderRadius: 8, background: type === 'pdf' ? '#fff1f0' : '#eff6ff', display: 'grid', placeItems: 'center', border: `1px solid ${type === 'pdf' ? '#fca5a5' : '#93c5fd'}` }}>
            <FileText size={16} color={type === 'pdf' ? '#dc2626' : '#2563eb'} />
          </div>
        )
      },
    },
    { key: 'title', label: 'Certificate' },
    { key: 'issuer', label: 'Issuer' },
    { key: 'issue_date', label: 'Issued' },
    {
      key: 'files',
      label: 'Files',
      render: (files) => (
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
          {files?.length || 0} file{files?.length !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'is_featured',
      label: 'Featured',
      render: (val) => (
        <span style={{
          display: 'inline-block', padding: '2px 10px', borderRadius: 999,
          fontSize: 11, fontWeight: 700,
          background: val ? '#ede9fe' : '#f1f5f9',
          color: val ? '#7c3aed' : '#94a3b8',
        }}>
          {val ? 'Yes' : 'No'}
        </span>
      ),
    },
  ]

  return (
    <div className="manager">
      <div className="manager-header">
        <div className="manager-header-left">
          <Award size={22} color="#6366f1" />
          <h2>Certificates</h2>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add Certificate
        </button>
      </div>

      <Table columns={columns} data={certs} onEdit={openEdit} onDelete={handleDelete} loading={loading} />

      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Certificate' : 'Add Certificate'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          submitText={editingId ? 'Save Changes' : 'Add Certificate'}
          submitting={submitting}
        >
          {/* Certificate details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <FormField label="Certificate Title" value={formData.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <FormField label="Issuing Organization" value={formData.issuer} onChange={e => set('issuer', e.target.value)} required />
            </div>
            <FormField label="Issue Date" type="date" value={formData.issue_date} onChange={e => set('issue_date', e.target.value)} required />
            <FormField label="Expiry Date (blank = no expiry)" type="date" value={formData.expiry_date} onChange={e => set('expiry_date', e.target.value)} />
            <FormField label="Credential ID" value={formData.credential_id} onChange={e => set('credential_id', e.target.value)} />
            <FormField label="Credential URL" type="url" value={formData.credential_url} onChange={e => set('credential_url', e.target.value)} />
          </div>

          <FormField
            label="Description (optional)"
            type="textarea"
            value={formData.description}
            onChange={e => set('description', e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Display Order" type="number" value={formData.order} onChange={e => set('order', parseInt(e.target.value) || 0)} />
            <div style={{ paddingTop: 28 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={e => set('is_featured', e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#6366f1' }}
                />
                <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Featured certificate</span>
              </label>
            </div>
          </div>

          {/* Files section */}
          <div style={{ marginTop: 8 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              Certificate Files
            </label>

            {/* File grid */}
            {(existingFiles.length > 0 || pendingFiles.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                {existingFiles.map(f => (
                  <FileThumb key={f.id} src={f.file} onRemove={() => removeExisting(f.id)} />
                ))}
                {pendingFiles.map(f => (
                  <FileThumb key={f.tempId} file={f.file} onRemove={() => removePending(f.tempId)} />
                ))}
              </div>
            )}

            {/* Add files button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 10, border: '1.5px dashed #cbd5e1',
                background: '#f8fafc', cursor: 'pointer', fontSize: 13,
                color: '#64748b', fontWeight: 500, width: '100%', justifyContent: 'center',
              }}
            >
              <Plus size={16} /> Add files (images, PDF, Word)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT}
              onChange={handleFilesChange}
              style={{ display: 'none' }}
            />
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>Accepted: JPG, PNG, GIF, PDF, DOC, DOCX · Multiple files allowed</p>
          </div>
        </ModalForm>
      )}
    </div>
  )
}
