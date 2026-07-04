import React, { useEffect, useState } from 'react'
import { Plus, Briefcase } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { FormField, ModalForm, Table } from './Form'
import './Manager.css'

export default function ExperienceManager() {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    start_date: '',
    end_date: '',
    is_current: false,
    order: 0,
  })

  useEffect(() => {
    loadExperiences()
  }, [])

  const loadExperiences = async () => {
    try {
      setLoading(true)
      const response = await apiService.getExperiences()
      setExperiences(response.data)
    } catch (error) {
      console.error('Failed to load experiences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({
      title: '',
      company: '',
      description: '',
      start_date: '',
      end_date: '',
      is_current: false,
      order: experiences.length === 0 ? 0 : Math.max(...experiences.map(x => x.order)) + 1,
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await apiService.deleteExperience(id)
      setExperiences(experiences.filter((e) => e.id !== id))
    } catch (error) {
      console.error('Failed to delete experience:', error)
      alert('Failed to delete experience')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const targetOrder = formData.order
      const conflicting = experiences.filter(x => x.order === targetOrder && x.id !== editingId)
      if (conflicting.length > 0) {
        const maxOrder = Math.max(...experiences.map(x => x.order), targetOrder)
        await Promise.all(conflicting.map((x, i) => apiService.updateExperience(x.id, { order: maxOrder + 1 + i })))
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
      } else {
        await apiService.createExperience(payload)
      }

      setShowForm(false)
      loadExperiences()
    } catch (error) {
      console.error('Failed to save experience:', error)
      alert('Failed to save experience')
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'company', label: 'Company' },
    { key: 'start_date', label: 'Start' },
    { key: 'end_date', label: 'End', render: (val, row) => (row.is_current ? 'Present' : (val || '')) },
    { key: 'order', label: 'Order' },
  ]

  return (
    <div className="manager">
      <div className="manager-header">
        <div className="manager-header-left">
          <Briefcase size={22} color="#6366f1" />
          <h2>Experience</h2>
          {!loading && experiences.length > 0 && (
            <span className="skill-count-badge">{experiences.length}</span>
          )}
        </div>
        <button className="btn-primary" onClick={handleAdd}>
          <Plus size={20} /> Add Experience
        </button>
      </div>

      <Table
        columns={columns}
        data={experiences}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Experience' : 'Add Experience'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        >
          <FormField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <FormField
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <FormField
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
          <FormField
            label="End Date"
            type="date"
            value={formData.end_date || ''}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required={!formData.is_current}
          />
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={!!formData.is_current}
                onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
              />
              Current
            </label>
          </div>
          <FormField
            label="Order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
          />
        </ModalForm>
      )}
    </div>
  )
}
