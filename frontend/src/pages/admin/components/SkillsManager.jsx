import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { Plus, Code2, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { AdminToast, ConfirmDialog, FormField, ModalForm } from './Form'
import './Manager.css'

function initials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  return words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function SkillChip({ skill, idx, total, canReorder, reordering, onMove, onEdit, onDelete }) {
  return (
    <div className="skill-chip">
      <div className="skill-chip-initial" aria-hidden="true">{initials(skill.name)}</div>
      <span className="skill-chip-name">{skill.name}</span>
      <div className="skill-chip-actions">
        {canReorder && (
          <>
            <button
              type="button"
              className="skill-act"
              onClick={() => onMove(idx, idx - 1)}
              disabled={reordering || idx === 0}
              title="Move earlier"
              aria-label={`Move ${skill.name} earlier`}
            >
              <ChevronLeft size={12} />
            </button>
            <button
              type="button"
              className="skill-act"
              onClick={() => onMove(idx, idx + 1)}
              disabled={reordering || idx === total - 1}
              title="Move later"
              aria-label={`Move ${skill.name} later`}
            >
              <ChevronRight size={12} />
            </button>
          </>
        )}
        <button
          type="button"
          className="skill-act skill-act--edit"
          onClick={() => onEdit(skill)}
          title="Edit"
          aria-label={`Edit ${skill.name}`}
        >
          <Pencil size={12} />
        </button>
        <button
          type="button"
          className="skill-act skill-act--del"
          onClick={() => onDelete(skill)}
          title="Delete"
          aria-label={`Delete ${skill.name}`}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

const EMPTY = { name: '', order: 0 }

export default function SkillsManager() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiService.getSkills()
      setSkills(res.data)
    } catch {
      showToast('Failed to load skills.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
    return () => clearTimeout(toastTimer.current)
  }, [load])

  const nextOrder = (list) => list.length === 0 ? 1 : Math.max(...list.map(x => x.order)) + 1
  const openAdd = () => { setFormData({ name: '', order: nextOrder(skills) }); setEditingId(null); setShowForm(true) }

  const openEdit = (skill) => {
    setFormData({ name: skill.name, order: skill.order ?? 0 })
    setEditingId(skill.id)
    setShowForm(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiService.deleteSkill(deleteTarget.id)
      setSkills(prev => prev.filter(s => s.id !== deleteTarget.id))
      setDeleteTarget(null)
      showToast('Skill deleted')
    } catch {
      showToast('Failed to delete skill.', 'error')
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
      const toShift = skills
        .filter(s => s.order >= targetOrder && s.id !== editingId)
        .sort((a, b) => b.order - a.order)
      for (const s of toShift) {
        await apiService.updateSkill(s.id, { order: s.order + 1 })
      }
      const payload = { name: formData.name, order: targetOrder, proficiency: 80 }
      if (editingId) {
        await apiService.updateSkill(editingId, payload)
        showToast('Skill updated')
      } else {
        await apiService.createSkill(payload)
        showToast('Skill added')
      }
      setShowForm(false)
      load()
    } catch {
      showToast('Failed to save skill.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const set = (k, v) => setFormData(prev => ({ ...prev, [k]: v }))

  const handleReorder = async (fromIdx, toIdx) => {
    if (reordering || toIdx < 0 || toIdx >= skills.length) return
    const nextList = [...skills]
    const [moved] = nextList.splice(fromIdx, 1)
    nextList.splice(toIdx, 0, moved)
    const normalized = nextList.map((s, idx) => ({ ...s, order: idx + 1 }))
    const prevList = skills
    setReordering(true)
    setSkills(normalized)
    try {
      const changed = normalized.filter((s) => {
        const prev = prevList.find((x) => x.id === s.id)
        return prev && prev.order !== s.order
      })
      for (const s of changed) {
        await apiService.updateSkill(s.id, { order: s.order })
      }
      showToast('Skill order updated')
    } catch {
      setSkills(prevList)
      showToast('Failed to reorder skills.', 'error')
    } finally {
      setReordering(false)
    }
  }

  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return skills
    return skills.filter((s) => (s.name || '').toLowerCase().includes(q))
  }, [skills, search])

  const isFiltered = Boolean(search.trim())

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
              placeholder="Filter skills…"
              aria-label="Filter skills"
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
          {!loading && skills.length > 0 && (
            <span className="manager-result-meta">
              {isFiltered ? `${filteredSkills.length} of ${skills.length}` : `${skills.length} total`}
            </span>
          )}
        </div>
        <button type="button" className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Skill
        </button>
      </div>

      {loading ? (
        <div className="skill-chip-grid" aria-busy="true" aria-label="Loading skills">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="table-skeleton__bar" style={{ width: 96 + (i % 3) * 26, height: 38, borderRadius: 10 }} />
          ))}
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="table-empty">
          <div className="table-empty__icon" aria-hidden="true">
            <Code2 size={22} />
          </div>
          <p className="table-empty__title">{isFiltered ? 'No matching skills' : 'No skills yet'}</p>
          <p className="table-empty__desc">
            {isFiltered
              ? 'No skills match your filter query.'
              : 'Add technologies and tools you work with to showcase your toolkit.'}
          </p>
          <button
            type="button"
            className="btn-primary table-empty__cta"
            onClick={isFiltered ? () => setSearch('') : openAdd}
          >
            {isFiltered ? 'Clear Filter' : <><Plus size={15} /> Add Skill</>}
          </button>
        </div>
      ) : (
        <div className="skill-chip-grid">
          {filteredSkills.map((s, idx) => (
            <SkillChip
              key={s.id}
              skill={s}
              idx={idx}
              total={filteredSkills.length}
              canReorder={!isFiltered && skills.length > 1}
              reordering={reordering}
              onMove={handleReorder}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Skill' : 'Add Skill'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          submitText={editingId ? 'Save Changes' : 'Add Skill'}
          submitting={submitting}
        >
          <FormField
            label="Skill Name"
            name="skill-name"
            value={formData.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. React, Python, Docker"
            required
            autoFocus
          />
          <FormField
            label="Display Order"
            name="skill-order"
            type="number"
            min={0}
            value={formData.order}
            onChange={e => set('order', parseInt(e.target.value, 10) || 0)}
          />
        </ModalForm>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete skill?"
        message={deleteTarget ? `Remove "${deleteTarget.name}" from your portfolio skills?` : ''}
        confirmText="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
