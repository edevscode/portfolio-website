import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Briefcase, Search, X } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { AdminToast, ConfirmDialog, FormField, ModalForm, Table } from './Form'
import './Manager.css'

export default function ExperienceManager() {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    start_date: '',
    end_date: '',
    is_current: false,
    order: 0,
  })

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const loadExperiences = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiService.getExperiences()
      setExperiences(response.data)
    } catch (error) {
      console.error('Failed to load experiences:', error)
      showToast('Failed to load experience entries', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadExperiences()
    return () => clearTimeout(toastTimer.current)
  }, [loadExperiences])

  const handleAdd = () => {
    setFormData({
      title: '',
      company: '',
      description: '',
      start_date: '',
      end_date: '',
      is_current: false,
      order: experiences.length === 0 ? 1 : Math.max(...experiences.map(x => x.order)) + 1,
    })
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (experience) => {
    setFormData({
      ...experience,
      start_date: experience.start_date || '',
      end_date: experience.end_date || '',
    })
    setEditingId(experience.id)
    setShowForm(true)
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleting(true)
    try {
      await apiService.deleteExperience(deleteTargetId)
      setExperiences((prev) => prev.filter((e) => e.id !== deleteTargetId))
      setDeleteTargetId(null)
      showToast('Experience deleted')
    } catch (error) {
      console.error('Failed to delete experience:', error)
      showToast('Failed to delete experience', 'error')
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
      const toShift = experiences
        .filter(x => x.order >= targetOrder && x.id !== editingId)
        .sort((a, b) => b.order - a.order)
      for (const x of toShift) {
        await apiService.updateExperience(x.id, { order: x.order + 1 })
      }
      const payload = {
        ...formData,
        end_date: formData.end_date || null,
      }

      if (payload.is_current) {
        payload.end_date = null
      }

      if (editingId) {
        await apiService.updateExperience(editingId, payload)
        showToast('Experience updated')
      } else {
        await apiService.createExperience(payload)
        showToast('Experience added')
      }

      setShowForm(false)
      loadExperiences()
    } catch (error) {
      console.error('Failed to save experience:', error)
      showToast('Failed to save experience', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReorder = async (fromIdx, toIdx) => {
    if (reordering || toIdx < 0 || toIdx >= experiences.length) return
    const nextList = [...experiences]
    const [moved] = nextList.splice(fromIdx, 1)
    nextList.splice(toIdx, 0, moved)
    const normalized = nextList.map((x, idx) => ({ ...x, order: idx + 1 }))
    const prevList = experiences
    setReordering(true)
    setExperiences(normalized)
    try {
      const changed = normalized.filter((x) => {
        const prev = prevList.find((p) => p.id === x.id)
        return prev && prev.order !== x.order
      })
      for (const x of changed) {
        await apiService.updateExperience(x.id, { order: x.order })
      }
      showToast('Experience order updated')
    } catch {
      setExperiences(prevList)
      showToast('Failed to reorder experience entries', 'error')
    } finally {
      setReordering(false)
    }
  }

  const filteredExperiences = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return experiences
    return experiences.filter(
      (x) =>
        (x.title || '').toLowerCase().includes(q) ||
        (x.company || '').toLowerCase().includes(q)
    )
  }, [experiences, search])

  const isFiltered = Boolean(search.trim())

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'company', label: 'Company' },
    { key: 'start_date', label: 'Start' },
    {
      key: 'end_date',
      label: 'End',
      render: (val, row) =>
        row.is_current
          ? <span className="badge badge--green">Present</span>
          : (val || '—'),
    },
    { key: 'order', label: 'Order' },
  ]

  const deleteTarget = experiences.find((x) => x.id === deleteTargetId)

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
              placeholder="Search roles or companies…"
              aria-label="Search experience"
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
          {!loading && experiences.length > 0 && (
            <span className="manager-result-meta">
              {isFiltered ? `${filteredExperiences.length} of ${experiences.length}` : `${experiences.length} total`}
            </span>
          )}
        </div>
        <button type="button" className="btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Add Experience
        </button>
      </div>

      <Table
        columns={columns}
        data={filteredExperiences}
        onEdit={handleEdit}
        onDelete={setDeleteTargetId}
        onMoveUp={!isFiltered && experiences.length > 1 ? (idx) => handleReorder(idx, idx - 1) : undefined}
        onMoveDown={!isFiltered && experiences.length > 1 ? (idx) => handleReorder(idx, idx + 1) : undefined}
        reordering={reordering}
        loading={loading}
        emptyIcon={Briefcase}
        emptyText={isFiltered ? 'No matching roles' : 'No work experience yet'}
        emptyDescription={
          isFiltered
            ? 'Try searching for a different role or company.'
            : 'Add your work history to build your portfolio career timeline.'
        }
        emptyAction={
          isFiltered
            ? { label: 'Clear Search', onClick: () => setSearch('') }
            : { label: 'Add Experience', onClick: handleAdd }
        }
      />

      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Experience' : 'Add Experience'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          submitting={submitting}
        >
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <FormField
            label="Company"
            name="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
          <FormField
            label="Description"
            name="description"
            type="markdown"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
          />
          <div className="form-grid-2">
            <FormField
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
            <FormField
              label="End Date"
              name="end_date"
              type="date"
              value={formData.is_current ? '' : (formData.end_date || '')}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required={!formData.is_current}
              disabled={!!formData.is_current}
            />
          </div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={!!formData.is_current}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_current: e.target.checked,
                    end_date: e.target.checked ? '' : formData.end_date,
                  })
                }
              />
              Currently working here
            </label>
          </div>
          <FormField
            label="Display Order"
            name="order"
            type="number"
            min={0}
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
          />
        </ModalForm>
      )}

      <ConfirmDialog
        open={!!deleteTargetId}
        title="Delete experience?"
        message={deleteTarget ? `Remove "${deleteTarget.title}" from your experience timeline?` : ''}
        confirmText="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
