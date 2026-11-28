import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Plus, Award, X, FileText, Search } from 'lucide-react'
import { apiService, API_BASE_URL } from '../../../services/apiService'
import { AdminToast, ConfirmDialog, FormField, ModalForm, Table } from './Form'
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
  const objectUrl = useMemo(
    () => (file && type === 'image' ? URL.createObjectURL(file) : null),
    [file, type]
  )

  useEffect(() => {
    if (!objectUrl) return undefined
    return () => {
      try { URL.revokeObjectURL(objectUrl) } catch { /* noop */ }
    }
  }, [objectUrl])

  const inner = type === 'image' ? (
    <img
      src={file ? objectUrl : url}
      alt=""
      className="cert-file-thumb__img"
    />
  ) : (
    <div className={`cert-file-thumb__doc cert-file-thumb__doc--${type}`}>
      <FileText size={20} />
      <span className="cert-file-thumb__ext">
        {type === 'pdf' ? 'PDF' : 'DOC'}
      </span>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="cert-file-thumb__link"
          onClick={e => e.stopPropagation()}
        >
          View
        </a>
      )}
    </div>
  )

  return (
    <div className="cert-file-thumb">
      {inner}
      {onRemove && (
        <button
          type="button"
          className="cert-file-thumb__remove"
          onClick={onRemove}
          aria-label="Remove file"
        >
          <X size={11} />
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
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [reordering, setReordering] = useState(false)
  const [search, setSearch] = useState('')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [toast, setToast] = useState(null)
  const fileInputRef = useRef(null)
  const toastTimer = useRef(null)

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiService.getCertificates()
      setCerts(res.data)
    } catch {
      showToast('Failed to load certificates.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
    return () => clearTimeout(toastTimer.current)
  }, [load])

  const openAdd = () => {
    setFormData({ ...EMPTY, order: certs.length === 0 ? 1 : Math.max(...certs.map(c => c.order)) + 1 })
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

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleting(true)
    try {
      await apiService.deleteCertificate(deleteTargetId)
      setCerts(prev => prev.filter(c => c.id !== deleteTargetId))
      setDeleteTargetId(null)
      showToast('Certificate deleted')
    } catch {
      showToast('Failed to delete certificate.', 'error')
    } finally {
      setDeleting(false)
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
      showToast('File removed')
    } catch {
      showToast('Failed to remove file.', 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const targetOrder = formData.order
      const toShift = certs
        .filter(c => c.order >= targetOrder && c.id !== editingId)
        .sort((a, b) => b.order - a.order)
      for (const c of toShift) {
        await apiService.updateCertificate(c.id, { order: c.order + 1 })
      }
      const fd = new FormData()
      Object.entries(formData).forEach(([k, v]) => {
        if (v === '' || v === null || v === undefined) return
        fd.append(k, typeof v === 'boolean' ? (v ? 'true' : 'false') : v)
      })
      pendingFiles.forEach(({ file }) => fd.append('files', file))

      if (editingId) {
        await apiService.updateCertificate(editingId, fd)
        showToast('Certificate updated')
      } else {
        await apiService.createCertificate(fd)
        showToast('Certificate added')
      }
      setShowForm(false)
      load()
    } catch (err) {
      showToast('Failed to save: ' + (err?.response?.data ? JSON.stringify(err.response.data) : err.message), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }))

  const handleToggleFeatured = async (cert) => {
    if (togglingId === cert.id) return
    const nextVal = !cert.is_featured
    setTogglingId(cert.id)
    setCerts((prev) => prev.map((c) => (c.id === cert.id ? { ...c, is_featured: nextVal } : c)))
    try {
      await apiService.updateCertificate(cert.id, { is_featured: nextVal })
      showToast(nextVal ? `"${cert.title}" marked featured` : `"${cert.title}" removed from featured`)
    } catch {
      setCerts((prev) => prev.map((c) => (c.id === cert.id ? { ...c, is_featured: !nextVal } : c)))
      showToast('Failed to update certificate.', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  const handleReorder = async (fromIdx, toIdx) => {
    if (reordering || toIdx < 0 || toIdx >= certs.length) return
    const nextList = [...certs]
    const [moved] = nextList.splice(fromIdx, 1)
    nextList.splice(toIdx, 0, moved)
    const normalized = nextList.map((c, idx) => ({ ...c, order: idx + 1 }))
    const prevList = certs
    setReordering(true)
    setCerts(normalized)
    try {
      const changed = normalized.filter((c) => {
        const prev = prevList.find((x) => x.id === c.id)
        return prev && prev.order !== c.order
      })
      for (const c of changed) {
        await apiService.updateCertificate(c.id, { order: c.order })
      }
      showToast('Certificate order updated')
    } catch {
      setCerts(prevList)
      showToast('Failed to reorder certificates.', 'error')
    } finally {
      setReordering(false)
    }
  }

  const filteredCerts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return certs.filter((c) => {
      if (featuredOnly && !c.is_featured) return false
      if (q && !(c.title || '').toLowerCase().includes(q) && !(c.issuer || '').toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [certs, search, featuredOnly])

  const isFiltered = Boolean(search.trim() || featuredOnly)

  const columns = [
    {
      key: 'files',
      label: '',
      render: (files) => {
        const first = files?.[0]
        if (!first) return (
          <div className="cert-table-icon">
            <Award size={17} />
          </div>
        )
        const type = first.file_type || fileType(first.file)
        if (type === 'image') return (
          <img src={normalizeUrl(first.file)} alt="" className="table-thumb" />
        )
        return (
          <div className={`cert-table-icon cert-table-icon--${type}`}>
            <FileText size={16} />
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
        <span className="badge badge--gray">
          {files?.length || 0} file{files?.length !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'is_featured',
      label: 'Featured',
      render: (val, row) => (
        <button
          type="button"
          className={`badge badge-toggle ${val ? 'badge--purple' : 'badge--gray'}`}
          onClick={() => handleToggleFeatured(row)}
          disabled={togglingId === row.id}
          title={val ? 'Click to unfeature' : 'Click to feature'}
          aria-pressed={!!val}
        >
          {val ? 'Featured' : 'Standard'}
        </button>
      ),
    },
  ]

  const deleteTarget = certs.find(c => c.id === deleteTargetId)

  return (
    <div className="manager">
      <div className="manager-toolbar">
        <div className="manager-toolbar-left">
          <div className="manager-search">
            <Search size={14} className="manager-search__icon" aria-hidden="true" />
            <input
              type="search"
              className="manager-search__input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search certificates…"
              aria-label="Search certificates"
            />
            {search && (
              <button
                type="button"
                className="manager-search__clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="manager-filter-pills" role="group" aria-label="Filter certificates">
            <button
              type="button"
              className={`manager-filter-pill${!featuredOnly ? ' is-active' : ''}`}
              aria-pressed={!featuredOnly}
              onClick={() => setFeaturedOnly(false)}
            >
              All
            </button>
            <button
              type="button"
              className={`manager-filter-pill${featuredOnly ? ' is-active' : ''}`}
              aria-pressed={featuredOnly}
              onClick={() => setFeaturedOnly(true)}
            >
              Featured
            </button>
          </div>

          {!loading && certs.length > 0 && (
            <span className="manager-result-meta">
              {isFiltered ? `${filteredCerts.length} of ${certs.length}` : `${certs.length} total`}
            </span>
          )}
        </div>

        <button type="button" className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Certificate
        </button>
      </div>

      <Table
        columns={columns}
        data={filteredCerts}
        onEdit={openEdit}
        onDelete={setDeleteTargetId}
        onMoveUp={!isFiltered && certs.length > 1 ? (idx) => handleReorder(idx, idx - 1) : undefined}
        onMoveDown={!isFiltered && certs.length > 1 ? (idx) => handleReorder(idx, idx + 1) : undefined}
        reordering={reordering}
        loading={loading}
        emptyIcon={Award}
        emptyText={isFiltered ? 'No matching certificates' : 'No certificates yet'}
        emptyDescription={
          isFiltered
            ? 'Try adjusting your search or clearing the filter.'
            : 'Add certifications and credentials to display on your portfolio.'
        }
        emptyAction={
          isFiltered
            ? { label: 'Clear Filters', onClick: () => { setSearch(''); setFeaturedOnly(false) } }
            : { label: 'Add Certificate', onClick: openAdd }
        }
      />

      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Certificate' : 'Add Certificate'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          submitText={editingId ? 'Save Changes' : 'Add Certificate'}
          submitting={submitting}
        >
          {/* Certificate details */}
          <div className="form-grid-2">
            <div className="form-grid-span">
              <FormField label="Certificate Title" name="title" value={formData.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="form-grid-span">
              <FormField label="Issuing Organization" name="issuer" value={formData.issuer} onChange={e => set('issuer', e.target.value)} required />
            </div>
            <FormField label="Issue Date" name="issue_date" type="date" value={formData.issue_date} onChange={e => set('issue_date', e.target.value)} required />
            <FormField label="Expiry Date (optional)" name="expiry_date" type="date" value={formData.expiry_date} onChange={e => set('expiry_date', e.target.value)} />
            <FormField label="Credential ID" name="credential_id" value={formData.credential_id} onChange={e => set('credential_id', e.target.value)} />
            <FormField label="Credential URL" name="credential_url" type="url" value={formData.credential_url} onChange={e => set('credential_url', e.target.value)} />
          </div>

          <FormField
            label="Description (optional)"
            name="description"
            type="markdown"
            value={formData.description}
            onChange={e => set('description', e.target.value)}
          />

          <div className="form-grid-2">
            <FormField label="Display Order" name="order" type="number" min={0} value={formData.order} onChange={e => set('order', parseInt(e.target.value, 10) || 0)} />
            <div className="cert-featured-cell">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={e => set('is_featured', e.target.checked)}
                />
                <span className="toggle-track" />
                <span className="toggle-text">Featured certificate</span>
              </label>
            </div>
          </div>

          {/* Files section */}
          <div className="cert-files-section">
            <span className="cert-files-label">Certificate Files</span>

            {(existingFiles.length > 0 || pendingFiles.length > 0) && (
              <div className="cert-files-grid">
                {existingFiles.map(f => (
                  <FileThumb key={f.id} src={f.file} onRemove={() => removeExisting(f.id)} />
                ))}
                {pendingFiles.map(f => (
                  <FileThumb key={f.tempId} file={f.file} onRemove={() => removePending(f.tempId)} />
                ))}
              </div>
            )}

            <button
              type="button"
              className="cert-add-files-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={15} /> Add files (images, PDF, Word)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT}
              onChange={handleFilesChange}
              style={{ display: 'none' }}
            />
            <p className="cert-files-hint">Accepted: JPG, PNG, GIF, PDF, DOC, DOCX · Multiple files allowed</p>
          </div>
        </ModalForm>
      )}

      <ConfirmDialog
        open={!!deleteTargetId}
        title="Delete certificate?"
        message={deleteTarget ? `Permanently delete "${deleteTarget.title}" and its attached files?` : ''}
        confirmText="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
