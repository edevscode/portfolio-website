import React, { useState, useEffect } from 'react'
import { Plus, Code2, Pencil, Trash2 } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { ModalForm } from './Form'
import './Manager.css'

function initials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  return words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function SkillChip({ skill, onEdit, onDelete }) {
  return (
    <div className="skill-chip">
      <div className="skill-chip-initial">{initials(skill.name)}</div>
      <span className="skill-chip-name">{skill.name}</span>
      <div className="skill-chip-actions">
        <button className="skill-act skill-act--edit" onClick={() => onEdit(skill)} title="Edit">
          <Pencil size={12} />
        </button>
        <button className="skill-act skill-act--del" onClick={() => onDelete(skill.id)} title="Delete">
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

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setLoading(true)
      const res = await apiService.getSkills()
      setSkills(res.data)
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }

  const nextOrder = (list) => list.length === 0 ? 1 : Math.max(...list.map(x => x.order)) + 1
  const openAdd = () => { setFormData({ name: '', order: nextOrder(skills) }); setEditingId(null); setShowForm(true) }

  const openEdit = (skill) => {
    setFormData({ name: skill.name, order: skill.order ?? 0 })
    setEditingId(skill.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return
    try {
      await apiService.deleteSkill(id)
      setSkills(prev => prev.filter(s => s.id !== id))
    } catch {
      alert('Failed to delete skill.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const targetOrder = formData.order
      const conflicting = skills.filter(s => s.order === targetOrder && s.id !== editingId)
      if (conflicting.length > 0) {
        const maxOrder = Math.max(...skills.map(s => s.order), targetOrder)
        await Promise.all(conflicting.map((s, i) => apiService.updateSkill(s.id, { order: maxOrder + 1 + i })))
      }
      const payload = { name: formData.name, order: targetOrder, proficiency: 80 }
      if (editingId) {
        await apiService.updateSkill(editingId, payload)
      } else {
        await apiService.createSkill(payload)
      }
      setShowForm(false)
      load()
    } catch {
      alert('Failed to save skill.')
    } finally {
      setSubmitting(false)
    }
  }

  const set = (k, v) => setFormData(prev => ({ ...prev, [k]: v }))

  return (
    <div className="manager">
      <div className="manager-header">
        <div className="manager-header-left">
          <Code2 size={22} color="#6366f1" />
          <h2>Skills</h2>
          {!loading && skills.length > 0 && (
            <span className="skill-count-badge">{skills.length}</span>
          )}
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add Skill
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : skills.length === 0 ? (
        <div className="skill-empty">
          <Code2 size={40} color="#e2e8f0" />
          <p>No skills yet.</p>
          <button className="btn-primary" onClick={openAdd} style={{ marginTop: 4 }}>
            <Plus size={16} /> Add Skill
          </button>
        </div>
      ) : (
        <div className="skill-chip-grid">
          {skills.map(s => (
            <SkillChip key={s.id} skill={s} onEdit={openEdit} onDelete={handleDelete} />
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
          <div className="form-field">
            <label>Skill Name <span className="required">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. React, Python, Docker"
              required
              autoFocus
            />
          </div>
          <div className="form-field" style={{ maxWidth: 160 }}>
            <label>Display Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={e => set('order', parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>
        </ModalForm>
      )}
    </div>
  )
}
