import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { FormField, ModalForm, Table } from './Form'
import './Manager.css'

export default function ProjectsManager() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    github_url: '',
    is_featured: false,
    is_published: true,
    order: 0,
  })

  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [galleryItems, setGalleryItems] = useState([])
  const [pendingGalleryItems, setPendingGalleryItems] = useState([])
  const [pendingCaption, setPendingCaption] = useState('')
  const [replaceImages, setReplaceImages] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProjects()
      setProjects(response.data)
    } catch (error) {
      console.error('Failed to load projects:', error)
      alert('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const resetGalleryItems = () => {
    setGalleryItems((prev) => {
      prev.forEach((it) => {
        if (!it.previewUrl) return
        try {
          URL.revokeObjectURL(it.previewUrl)
        } catch {
          // ignore
        }
      })
      return []
    })

    setPendingGalleryItems((prev) => {
      prev.forEach((it) => {
        if (!it.previewUrl) return
        try {
          URL.revokeObjectURL(it.previewUrl)
        } catch {
          // ignore
        }
      })
      return []
    })

    setPendingCaption('')
  }

  const handleAdd = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      github_url: '',
      is_featured: false,
      is_published: true,
      order: 0,
    })
    setThumbnailFile(null)
    resetGalleryItems()
    setReplaceImages(false)
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (project) => {
    setFormData({
      ...project,
    })
    setThumbnailFile(null)
    resetGalleryItems()
    setReplaceImages(false)
    setEditingId(project.id)
    setShowForm(true)
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files && e.target.files[0]
    setThumbnailFile(file || null)
  }

  const handleGalleryFilesChange = (e) => {
    const files = Array.from((e.target.files || []))
    if (files.length === 0) return

    setPendingGalleryItems((prev) => {
      prev.forEach((it) => {
        if (!it.previewUrl) return
        try {
          URL.revokeObjectURL(it.previewUrl)
        } catch {
          // ignore
        }
      })

      return files.map((file) => {
        const key = `${file.name}|${file.size}|${file.lastModified}`
        return { key, file, previewUrl: URL.createObjectURL(file) }
      })
    })

    e.target.value = ''
  }

  const commitPendingImages = () => {
    if (pendingGalleryItems.length === 0) return

    setGalleryItems((prev) => {
      const existingKeys = new Set(prev.map((it) => it.key))
      const next = [...prev]
      pendingGalleryItems.forEach((it) => {
        if (existingKeys.has(it.key)) {
          try {
            URL.revokeObjectURL(it.previewUrl)
          } catch {
            // ignore
          }
          return
        }
        existingKeys.add(it.key)
        next.push({ ...it, caption: pendingCaption || '' })
      })
      return next
    })

    setPendingGalleryItems([])
    setPendingCaption('')
  }

  const removeGalleryItem = (key) => {
    setGalleryItems((prev) => {
      const target = prev.find((it) => it.key === key)
      if (target?.previewUrl) {
        try {
          URL.revokeObjectURL(target.previewUrl)
        } catch {
          // ignore
        }
      }
      return prev.filter((it) => it.key !== key)
    })
  }

  const clearGalleryItems = () => {
    resetGalleryItems()
  }

  const clearPendingGalleryItems = () => {
    setPendingGalleryItems((prev) => {
      prev.forEach((it) => {
        if (!it.previewUrl) return
        try {
          URL.revokeObjectURL(it.previewUrl)
        } catch {
          // ignore
        }
      })
      return []
    })
    setPendingCaption('')
  }

  const handleClose = () => {
    resetGalleryItems()
    setThumbnailFile(null)
    setReplaceImages(false)
    setEditingId(null)
    setShowForm(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return
    try {
      const project = projects.find(p => p.id === id)
      await apiService.deleteProject(project.slug)
      setProjects(projects.filter(p => p.id !== id))
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('Failed to delete project')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = new FormData()

      data.append('title', formData.title || '')
      data.append('description', formData.description || '')
      data.append('url', formData.url || '')
      data.append('github_url', formData.github_url || '')
      data.append('order', String(formData.order ?? 0))
      data.append('is_featured', String(!!formData.is_featured))
      data.append('is_published', String(!!formData.is_published))

      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile)
      }

      if (galleryItems.length > 0) {
        galleryItems.forEach((it) => {
          if (!it.file) return
          data.append('images', it.file)
          data.append('captions', it.caption || '')
        })
      }

      if (editingId && replaceImages) {
        data.append('replace_images', 'true')
      }

      if (editingId) {
        const project = projects.find(p => p.id === editingId)
        await apiService.updateProject(project.slug, data)
      } else {
        if (!thumbnailFile) {
          alert('Thumbnail is required')
          return
        }
        await apiService.createProject(data)
      }

      handleClose()
      loadProjects()
    } catch (error) {
      console.error('Failed to save project:', error)
      if (error?.response?.data) {
        console.error('Project save error response:', error.response.data)
      }
      alert('Failed to save project')
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'is_featured', label: 'Featured', render: (val) => val ? '✓' : '✗' },
    { key: 'is_published', label: 'Published', render: (val) => val ? '✓' : '✗' },
  ]

  return (
    <div className="manager">
      <div className="manager-header">
        <h2>Projects</h2>
        <button className="btn-primary" onClick={handleAdd}>
          <Plus size={20} /> Add Project
        </button>
      </div>

      <Table columns={columns} data={projects} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />

      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Project' : 'Add Project'}
          onSubmit={handleSubmit}
          onClose={handleClose}
        >
          <FormField
            label="Thumbnail"
            name="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            required={!editingId}
          />

          <FormField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <FormField
            label="Live Link"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <FormField
            label="GitHub Repo (Optional)"
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
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
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              Featured
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              />
              Published
            </label>
          </div>

          <div className="form-field">
            <label>Project Images</label>
            <div style={{ display: 'grid', gap: 10, marginBottom: 10 }}>
              <input type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} />
            </div>

            {pendingGalleryItems.length > 0 ? (
              <div style={{ display: 'grid', gap: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div>{pendingGalleryItems.length} pending image(s)</div>
                  <button type="button" className="btn-cancel" onClick={clearPendingGalleryItems}>
                    Clear pending
                  </button>
                </div>

                <input
                  type="text"
                  value={pendingCaption}
                  onChange={(e) => setPendingCaption(e.target.value)}
                  placeholder="One caption applied to ALL selected images"
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  {pendingGalleryItems.map((it) => (
                    <div key={it.key} style={{ height: 120, borderRadius: 10, overflow: 'hidden', background: 'rgba(0,0,0,0.05)' }}>
                      <img src={it.previewUrl} alt="Pending" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ))}
                </div>

                <div>
                  <button type="button" className="btn-submit" onClick={commitPendingImages}>
                    Add images
                  </button>
                </div>
              </div>
            ) : null}

            {galleryItems.length > 0 ? (
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div>{galleryItems.length} image(s) added</div>
                  <button type="button" className="btn-cancel" onClick={clearGalleryItems}>
                    Clear
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  {galleryItems.map((it) => (
                    <div key={it.key} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: 'rgba(0,0,0,0.05)' }}>
                      <div style={{ height: 140 }}>
                        <img
                          src={it.previewUrl}
                          alt="Selected"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>

                      <button
                        type="button"
                        className="btn-cancel"
                        style={{ position: 'absolute', right: 8, top: 8, padding: '4px 8px' }}
                        onClick={() => removeGalleryItem(it.key)}
                        aria-label="Remove image"
                      >
                        X
                      </button>

                      <div style={{ padding: 10, display: 'grid', gap: 8 }}>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>{it.caption || ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {editingId && (
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={replaceImages}
                  onChange={(e) => setReplaceImages(e.target.checked)}
                />
                Replace existing images
              </label>
            </div>
          )}
        </ModalForm>
      )}
    </div>
  )
}
