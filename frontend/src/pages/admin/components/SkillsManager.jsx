import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { FormField, ModalForm, Table } from './Form'
import './Manager.css'

export default function SkillsManager() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    proficiency: 80,
    order: 0,
  })

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      setLoading(true)
      const response = await apiService.getSkills()
      setSkills(response.data)
    } catch (error) {
      console.error('Failed to load skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({ name: '', proficiency: 80, order: 0 })
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (skill) => {
    setFormData(skill)
    setEditingId(skill.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await apiService.deleteSkill(id)
      setSkills(skills.filter(s => s.id !== id))
    } catch (error) {
      alert('Failed to delete skill')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await apiService.updateSkill(editingId, formData)
      } else {
        await apiService.createSkill(formData)
      }
      setShowForm(false)
      loadSkills()
    } catch (error) {
      alert('Failed to save skill')
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'proficiency', label: 'Proficiency', render: (val) => `${val}%` },
  ]

  return (
    <div className="manager">
      <div className="manager-header">
        <h2>Skills</h2>
        <button className="btn-primary" onClick={handleAdd}>
          <Plus size={20} /> Add Skill
        </button>
      </div>

      <Table columns={columns} data={skills} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />

      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Skill' : 'Add Skill'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        >
          <FormField
            label="Skill Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormField
            label="Proficiency (%)"
            type="number"
            value={formData.proficiency}
            onChange={(e) => setFormData({ ...formData, proficiency: parseInt(e.target.value) })}
          />
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
