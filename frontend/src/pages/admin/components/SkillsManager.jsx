import React, { useState, useEffect } from 'react'
import { Plus, Code2, Pencil, Trash2, Zap } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { ModalForm } from './Form'
import './Manager.css'

const LEVELS = [
  { key: 'expert',       label: 'Expert',       min: 86, color: '#7c3aed', bg: '#ede9fe' },
  { key: 'proficient',   label: 'Proficient',   min: 61, color: '#059669', bg: '#d1fae5' },
  { key: 'intermediate', label: 'Intermediate', min: 31, color: '#2563eb', bg: '#dbeafe' },
  { key: 'beginner',     label: 'Beginner',     min: 0,  color: '#d97706', bg: '#fef3c7' },
]

function getLevel(pct) {
  return LEVELS.find(l => pct >= l.min) || LEVELS[LEVELS.length - 1]
}

const QUICK_ICONS = [
  '⚛️','🐍','🟨','🌐','🎨','🟢','🐳','☁️','🔥','🗄️','🔐','📱','⚡','🤖','📊','🔀','🛠️','💡',
]

function SkillCard({ skill, onEdit, onDelete }) {
  const level = getLevel(skill.proficiency)
  const display = skill.icon || (skill.name ? skill.name.charAt(0).toUpperCase() : '?')

  return (
    <div className="skill-card">
      <div className="skill-card-body">
        <div
          className="skill-avatar"
          style={{ background: `${level.color}18`, color: level.color, border: `1.5px solid ${level.color}28` }}
        >
          {display}
        </div>
        <div className="skill-info">
          <div className="skill-name-row">
            <span className="skill-name-text">{skill.name}</span>
            <span className="skill-level-badge" style={{ background: level.bg, color: level.color }}>
              {level.label}
            </span>
          </div>
          <div className="skill-bar-track">
            <div
              className="skill-bar-fill"
              style={{ width: `${skill.proficiency}%`, background: `linear-gradient(90deg, ${level.color}cc, ${level.color})` }}
            />
          </div>
          <span className="skill-pct" style={{ color: level.color }}>{skill.proficiency}%</span>
        </div>
      </div>
      <div className="skill-card-actions">
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

const EMPTY = { name: '', proficiency: 75, icon: '', order: 0 }

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

  const openAdd = () => { setFormData(EMPTY); setEditingId(null); setShowForm(true) }

  const openEdit = (skill) => {
    setFormData({ name: skill.name, proficiency: skill.proficiency, icon: skill.icon || '', order: skill.order ?? 0 })
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
      if (editingId) {
        await apiService.updateSkill(editingId, formData)
      } else {
        await apiService.createSkill(formData)
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
  const level = getLevel(formData.proficiency)
  const previewDisplay = formData.icon || (formData.name ? formData.name.charAt(0).toUpperCase() : '?')

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
          <Zap size={44} color="#e2e8f0" />
          <p>No skills yet. Add your first skill!</p>
          <button className="btn-primary" onClick={openAdd} style={{ marginTop: 4 }}>
            <Plus size={16} /> Add Skill
          </button>
        </div>
      ) : (
        <div className="skill-grid">
          {skills.map(s => (
            <SkillCard key={s.id} skill={s} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Skill' : 'New Skill'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          submitText={editingId ? 'Save Changes' : 'Add Skill'}
          submitting={submitting}
        >
          {/* Live preview */}
          <div
            className="skill-preview"
            style={{ borderColor: `${level.color}35`, background: `${level.color}07` }}
          >
            <div
              className="skill-preview-avatar"
              style={{ background: `${level.color}18`, color: level.color, border: `1.5px solid ${level.color}30` }}
            >
              {previewDisplay}
            </div>
            <div className="skill-preview-body">
              <div className="skill-preview-top">
                <span className="skill-preview-name">{formData.name || <em style={{ opacity: 0.4 }}>Skill name</em>}</span>
                <span className="skill-level-badge" style={{ background: level.bg, color: level.color }}>{level.label}</span>
              </div>
              <div className="skill-bar-track">
                <div
                  className="skill-bar-fill"
                  style={{
                    width: `${formData.proficiency}%`,
                    background: `linear-gradient(90deg, ${level.color}cc, ${level.color})`,
                    transition: 'width 0.25s ease, background 0.25s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: 11, color: level.color, fontWeight: 700, marginTop: 2, display: 'block' }}>
                {formData.proficiency}%
              </span>
            </div>
          </div>

          {/* Name */}
          <div className="form-field">
            <label>Skill Name <span className="required">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. React, Python, Docker…"
              required
              autoFocus
            />
          </div>

          {/* Icon */}
          <div className="form-field">
            <label>
              Icon &nbsp;
              <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>emoji or short text (optional)</span>
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={e => set('icon', e.target.value)}
              placeholder="⚛️  or leave blank to use initials"
              maxLength={4}
            />
            <div className="icon-quick-pick">
              {QUICK_ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  className={`icon-pick-btn${formData.icon === ic ? ' icon-pick-btn--active' : ''}`}
                  onClick={() => set('icon', formData.icon === ic ? '' : ic)}
                  title={ic}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Proficiency slider */}
          <div className="form-field">
            <div className="proficiency-header">
              <label>Proficiency</label>
              <span className="proficiency-pill" style={{ background: level.bg, color: level.color }}>
                {formData.proficiency}%
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={formData.proficiency}
              onChange={e => set('proficiency', parseInt(e.target.value))}
              className="proficiency-slider"
              style={{ '--c': level.color, '--pct': `${formData.proficiency}%` }}
            />
            <div className="proficiency-ticks">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Expert</span>
            </div>
          </div>

          {/* Order */}
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
