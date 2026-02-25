import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { FormField, ModalForm, Table } from './Form'
import './Manager.css'

export default function SocialLinksManager() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    icon: '',
    order: 0,
    is_visible: true,
  })

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    try {
      setLoading(true)
      const response = await apiService.getSocialLinks()
      setLinks(response.data)
    } catch (error) {
      console.error('Failed to load social links:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({ platform: '', url: '', icon: '', order: 0, is_visible: true })
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (link) => {
    setFormData(link)
    setEditingId(link.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await apiService.deleteSocialLink(id)
      setLinks(links.filter((l) => l.id !== id))
    } catch (error) {
      console.error('Failed to delete social link:', error)
      alert('Failed to delete social link')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        icon: formData.icon || '',
        url: formData.url,
      }

      if (editingId) {
        await apiService.updateSocialLink(editingId, payload)
      } else {
        await apiService.createSocialLink(payload)
      }

      setShowForm(false)
      loadLinks()
    } catch (error) {
      console.error('Failed to save social link:', error)
      alert('Failed to save social link')
    }
  }

  const columns = [
    { key: 'platform', label: 'Platform' },
    { key: 'url', label: 'URL' },
    { key: 'is_visible', label: 'Visible', render: (val) => (val ? '✓' : '✗') },
    { key: 'order', label: 'Order' },
  ]

  return (
    <div className="manager">
      <div className="manager-header">
        <h2>Social Links</h2>
        <button className="btn-primary" onClick={handleAdd}>
          <Plus size={20} /> Add Link
        </button>
      </div>

      <Table
        columns={columns}
        data={links}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Social Link' : 'Add Social Link'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        >
          <FormField
            label="Platform"
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            placeholder="e.g., GitHub, LinkedIn, Facebook"
            required
          />
          <FormField
            label="URL"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
          />
          <FormField
            label="Icon (optional)"
            value={formData.icon || ''}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="e.g., lucide:github"
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
