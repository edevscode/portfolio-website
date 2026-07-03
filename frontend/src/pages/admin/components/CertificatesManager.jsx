import React, { useState, useEffect } from 'react'
import { Plus, Award } from 'lucide-react'
import { apiService, API_BASE_URL } from '../../../services/apiService'
import { FormField, ModalForm, Table } from './Form'
import './Manager.css'

function normalizeUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  try {
    return `${new URL(API_BASE_URL).origin}${url.startsWith('/') ? '' : '/'}${url}`
  } catch {
    return url
  }
}

const EMPTY = {
  title: '',
  issuer: '',
  description: '',
  issue_date: '',
  expiry_date: '',
  credential_id: '',
  credential_url: '',
  order: 0,
  is_featured: false,
  image: null,
}

export default function CertificatesManager() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

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
    setFormData(EMPTY)
    setImageFile(null)
    setImagePreview(null)
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
    setImageFile(null)
    setImagePreview(cert.image ? normalizeUrl(cert.image) : null)
    setEditingId(cert.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certificate?')) return
    try {
      await apiService.deleteCertificate(id)
      setCerts((prev) => prev.filter((c) => c.id !== id))
    } catch {
      alert('Failed to delete certificate.')
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(formData).forEach(([k, v]) => {
        if (v === '' || v === null || v === undefined) return
        fd.append(k, typeof v === 'boolean' ? (v ? 'true' : 'false') : v)
      })
      if (imageFile) fd.append('image', imageFile)

      if (editingId) {
        await apiService.updateCertificate(editingId, fd)
      } else {
        await apiService.createCertificate(fd)
      }
      setShowForm(false)
      load()
    } catch (err) {
      alert('Failed to save certificate. ' + (err?.response?.data ? JSON.stringify(err.response.data) : ''))
    } finally {
      setSubmitting(false)
    }
  }

  const set = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }))

  const columns = [
    {
      key: 'image',
      label: '',
      render: (val) =>
        val ? (
          <img
            src={normalizeUrl(val)}
            alt=""
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, display: 'block' }}
          />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'grid', placeItems: 'center' }}>
            <Award size={18} color="#94a3b8" />
          </div>
        ),
    },
    { key: 'title', label: 'Certificate' },
    { key: 'issuer', label: 'Issuer' },
    { key: 'issue_date', label: 'Issued' },
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

      <Table
        columns={columns}
        data={certs}
        onEdit={openEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Certificate' : 'Add Certificate'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          submitText={editingId ? 'Save Changes' : 'Add Certificate'}
          submitting={submitting}
        >
          {/* Certificate image */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Certificate Image / Badge
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 10, background: '#f8fafc' }}
              />
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'block', width: '100%', fontSize: 13 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <FormField label="Certificate Title" value={formData.title} onChange={(e) => set('title', e.target.value)} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <FormField label="Issuing Organization" value={formData.issuer} onChange={(e) => set('issuer', e.target.value)} required />
            </div>
            <FormField label="Issue Date" type="date" value={formData.issue_date} onChange={(e) => set('issue_date', e.target.value)} required />
            <FormField label="Expiry Date (leave blank = no expiry)" type="date" value={formData.expiry_date} onChange={(e) => set('expiry_date', e.target.value)} />
            <FormField label="Credential ID" value={formData.credential_id} onChange={(e) => set('credential_id', e.target.value)} />
            <FormField label="Credential URL" type="url" value={formData.credential_url} onChange={(e) => set('credential_url', e.target.value)} />
          </div>

          <FormField
            label="Description (optional)"
            type="textarea"
            value={formData.description}
            onChange={(e) => set('description', e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Display Order" type="number" value={formData.order} onChange={(e) => set('order', parseInt(e.target.value) || 0)} />
            <div style={{ paddingTop: 28 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => set('is_featured', e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#6366f1' }}
                />
                <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Featured certificate</span>
              </label>
            </div>
          </div>
        </ModalForm>
      )}
    </div>
  )
}
