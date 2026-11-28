import React, { useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { Plus, Link2 } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { AdminToast, ConfirmDialog, FormField, ModalForm, Table } from './Form'
import './Manager.css'

const SocialLinksManager = forwardRef(function SocialLinksManager({ embedded = false }, ref) {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [reordering, setReordering] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    icon: '',
    order: 0,
    is_visible: true,
  })

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const loadLinks = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiService.getSocialLinks()
      setLinks(response.data)
    } catch (error) {
      console.error('Failed to load social links:', error)
      showToast('Failed to load social links', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadLinks()
    return () => clearTimeout(toastTimer.current)
  }, [loadLinks])

  const handleAdd = () => {
    setFormData({ platform: '', url: '', icon: '', order: links.length === 0 ? 1 : Math.max(...links.map(l => l.order)) + 1, is_visible: true })
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (link) => {
    setFormData(link)
    setEditingId(link.id)
    setShowForm(true)
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleting(true)
    try {
      await apiService.deleteSocialLink(deleteTargetId)
      setLinks((prev) => prev.filter((l) => l.id !== deleteTargetId))
      setDeleteTargetId(null)
      showToast('Social link deleted')
    } catch (error) {
      console.error('Failed to delete social link:', error)
      showToast('Failed to delete social link', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const targetOrder = formData.order
      const toShift = links
        .filter(l => l.order >= targetOrder && l.id !== editingId)
        .sort((a, b) => b.order - a.order)
      for (const l of toShift) {
        await apiService.updateSocialLink(l.id, { order: l.order + 1 })
      }
      const payload = {
        ...formData,
        icon: formData.icon || '',
        url: formData.url,
      }

      if (editingId) {
        await apiService.updateSocialLink(editingId, payload)
        showToast('Social link updated')
      } else {
        await apiService.createSocialLink(payload)
        showToast('Social link added')
      }

      setShowForm(false)
      loadLinks()
    } catch (error) {
      console.error('Failed to save social link:', error)
      showToast('Failed to save social link', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  useImperativeHandle(ref, () => ({ openAdd: handleAdd }))

  const handleToggleVisible = async (link) => {
    if (togglingId === link.id) return
    const nextVal = !link.is_visible
    setTogglingId(link.id)
    setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, is_visible: nextVal } : l)))
    try {
      await apiService.updateSocialLink(link.id, { is_visible: nextVal })
      showToast(nextVal ? `${link.platform} is now visible` : `${link.platform} hidden`)
    } catch {
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, is_visible: !nextVal } : l)))
      showToast('Failed to update social link', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  const handleReorder = async (fromIdx, toIdx) => {
    if (reordering || toIdx < 0 || toIdx >= links.length) return
    const nextList = [...links]
    const [moved] = nextList.splice(fromIdx, 1)
    nextList.splice(toIdx, 0, moved)
    const normalized = nextList.map((l, idx) => ({ ...l, order: idx + 1 }))
    const prevList = links
    setReordering(true)
    setLinks(normalized)
    try {
      const changed = normalized.filter((l) => {
        const prev = prevList.find((x) => x.id === l.id)
        return prev && prev.order !== l.order
      })
      for (const l of changed) {
        await apiService.updateSocialLink(l.id, { order: l.order })
      }
      showToast('Social link order updated')
    } catch {
      setLinks(prevList)
      showToast('Failed to reorder social links', 'error')
    } finally {
      setReordering(false)
    }
  }

  const columns = [
    { key: 'platform', label: 'Platform' },
    {
      key: 'url',
      label: 'URL',
      render: (val) => (
        <span className="cell-truncate" title={val || ''}>
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'is_visible',
      label: 'Status',
      render: (val, row) => (
        <button
          type="button"
          className={`badge badge-toggle ${val ? 'badge--green' : 'badge--gray'}`}
          onClick={() => handleToggleVisible(row)}
          disabled={togglingId === row.id}
          title={val ? 'Click to hide link' : 'Click to show link'}
          aria-pressed={!!val}
        >
          {val ? 'Visible' : 'Hidden'}
        </button>
      ),
    },
    { key: 'order', label: 'Order' },
  ]

  const deleteTarget = links.find((l) => l.id === deleteTargetId)

  const tableEl = (
    <Table
      columns={columns}
      data={links}
      onEdit={handleEdit}
      onDelete={setDeleteTargetId}
      onMoveUp={links.length > 1 ? (idx) => handleReorder(idx, idx - 1) : undefined}
      onMoveDown={links.length > 1 ? (idx) => handleReorder(idx, idx + 1) : undefined}
      reordering={reordering}
      loading={loading}
      emptyIcon={Link2}
      emptyText="No social links yet"
      emptyDescription="Add GitHub, LinkedIn, or other social profiles to display on your portfolio."
      emptyAction={{ label: 'Add Link', onClick: handleAdd }}
    />
  )

  const overlays = (
    <>
      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Social Link' : 'Add Social Link'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          submitting={submitting}
        >
          <FormField
            label="Platform"
            name="platform"
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            placeholder="e.g., GitHub, LinkedIn, Facebook"
            required
          />
          <FormField
            label="URL"
            name="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
          />
          <FormField
            label="Display Order"
            name="order"
            type="number"
            min={0}
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
          />
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={!!formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
              />
              Visible on portfolio
            </label>
          </div>
        </ModalForm>
      )}

      <ConfirmDialog
        open={!!deleteTargetId}
        title="Delete social link?"
        message={deleteTarget ? `Remove "${deleteTarget.platform}" from your portfolio?` : ''}
        confirmText="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </>
  )

  if (embedded) {
    return (
      <>
        {tableEl}
        {overlays}
      </>
    )
  }

  return (
    <div className="manager">
      <div className="manager-header">
        <h2>Social Links</h2>
        <button type="button" className="btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Add Link
        </button>
      </div>
      {tableEl}
      {overlays}
    </div>
  )
})

export default SocialLinksManager
