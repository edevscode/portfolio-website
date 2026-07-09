import React, { useEffect, useState } from 'react'
import { Plus, Star } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { FormField, ModalForm, Table } from './Form'
import './Manager.css'

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    client_name: '',
    quote: '',
    rating: '',
    order: 0,
    is_visible: true,
  })

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    try {
      setLoading(true)
      const response = await apiService.getTestimonials()
      setTestimonials(response.data)
    } catch (error) {
      console.error('Failed to load testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({
      client_name: '',
      quote: '',
      rating: '',
      order: testimonials.length === 0 ? 1 : Math.max(...testimonials.map(t => t.order)) + 1,
      is_visible: true,
    })
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (t) => {
    setFormData({
      ...t,
      rating: t.rating ?? '',
    })
    setEditingId(t.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await apiService.deleteTestimonial(id)
      setTestimonials(testimonials.filter(x => x.id !== id))
    } catch (error) {
      console.error('Failed to delete testimonial:', error)
      alert('Failed to delete testimonial')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const targetOrder = parseInt(formData.order) || 0
      const toShift = testimonials
        .filter(t => t.order >= targetOrder && t.id !== editingId)
        .sort((a, b) => b.order - a.order)
      for (const t of toShift) {
        await apiService.updateTestimonial(t.id, { order: t.order + 1 })
      }
      const payload = {
        client_name: formData.client_name,
        quote: formData.quote,
        rating: formData.rating === '' ? null : parseInt(formData.rating),
        order: targetOrder,
        is_visible: !!formData.is_visible,
      }

      if (editingId) {
        await apiService.updateTestimonial(editingId, payload)
      } else {
        await apiService.createTestimonial(payload)
      }

      setShowForm(false)
      loadTestimonials()
    } catch (error) {
      console.error('Failed to save testimonial:', error)
      alert('Failed to save testimonial')
    }
  }

  const columns = [
    { key: 'client_name', label: 'Client' },
    { key: 'rating', label: 'Rating', render: (val) => (val ? `${val}/5` : '') },
    { key: 'is_visible', label: 'Visible', render: (val) => (val ? '✓' : '✗') },
    { key: 'order', label: 'Order' },
  ]

  return (
    <div className="manager">
      <div className="manager-header">
        <div className="manager-header-left">
          <Star size={22} color="#6366f1" />
          <h2>Testimonials</h2>
          {!loading && testimonials.length > 0 && (
            <span className="skill-count-badge">{testimonials.length}</span>
          )}
        </div>
        <button className="btn-primary" onClick={handleAdd}>
          <Plus size={20} /> Add Testimonial
        </button>
      </div>

      <Table
        columns={columns}
        data={testimonials}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Testimonial' : 'Add Testimonial'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        >
          <FormField
            label="Client Name"
            value={formData.client_name}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            required
          />
          <FormField
            label="Quote"
            type="markdown"
            value={formData.quote}
            onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
            required
          />
          <FormField
            label="Rating (1-5)"
            type="number"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            min={1}
            max={5}
          />
          <FormField
            label="Order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
          />
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={!!formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
              />
              Visible
            </label>
          </div>
        </ModalForm>
      )}
    </div>
  )
}
