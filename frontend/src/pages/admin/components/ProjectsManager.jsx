import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
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
    project_type: 'live',
    is_featured: false,
    is_published: true,
    order: 0,
  })

  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [galleryItems, setGalleryItems] = useState([])
  const [pendingGalleryItems, setPendingGalleryItems] = useState([])
  const [pendingCaption, setPendingCaption] = useState('')
  const [replaceImages, setReplaceImages] = useState(false)

  const [videoItems, setVideoItems] = useState([])
  const [pendingVideoItems, setPendingVideoItems] = useState([])
  const [pendingVideoCaption, setPendingVideoCaption] = useState('')
  const [replaceVideos, setReplaceVideos] = useState(false)

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

  const revokeAll = (items) => items.forEach((it) => { if (it.previewUrl) try { URL.revokeObjectURL(it.previewUrl) } catch { } })

  const resetGalleryItems = () => {
    setGalleryItems((prev) => { revokeAll(prev); return [] })
    setPendingGalleryItems((prev) => { revokeAll(prev); return [] })
    setPendingCaption('')
  }

  const resetVideoItems = () => {
    setVideoItems((prev) => { revokeAll(prev); return [] })
    setPendingVideoItems((prev) => { revokeAll(prev); return [] })
    setPendingVideoCaption('')
  }

  const handleAdd = () => {
    setFormData({ title: '', description: '', url: '', github_url: '', project_type: 'live', is_featured: false, is_published: true, order: 0 })
    setThumbnailFile(null)
    resetGalleryItems()
    resetVideoItems()
    setReplaceImages(false)
    setReplaceVideos(false)
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (project) => {
    setFormData({ ...project })
    setThumbnailFile(null)
    resetGalleryItems()
    resetVideoItems()
    setReplaceImages(false)
    setReplaceVideos(false)
    setEditingId(project.id)
    setShowForm(true)
  }

  const handleThumbnailChange = (e) => {
    setThumbnailFile(e.target.files?.[0] || null)
  }

  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setPendingGalleryItems((prev) => { revokeAll(prev); return [] })
    setPendingGalleryItems(files.map((file) => ({
      key: `${file.name}|${file.size}|${file.lastModified}`,
      file,
      previewUrl: URL.createObjectURL(file),
    })))
    e.target.value = ''
  }

  const commitPendingImages = () => {
    if (!pendingGalleryItems.length) return
    setGalleryItems((prev) => {
      const existingKeys = new Set(prev.map((it) => it.key))
      const next = [...prev]
      pendingGalleryItems.forEach((it) => {
        if (existingKeys.has(it.key)) { try { URL.revokeObjectURL(it.previewUrl) } catch { } return }
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
      if (target?.previewUrl) try { URL.revokeObjectURL(target.previewUrl) } catch { }
      return prev.filter((it) => it.key !== key)
    })
  }

  const handleVideoFilesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setPendingVideoItems((prev) => { revokeAll(prev); return [] })
    setPendingVideoItems(files.map((file) => ({
      key: `${file.name}|${file.size}|${file.lastModified}`,
      file,
      previewUrl: URL.createObjectURL(file),
    })))
    e.target.value = ''
  }

  const commitPendingVideos = () => {
    if (!pendingVideoItems.length) return
    setVideoItems((prev) => {
      const existingKeys = new Set(prev.map((it) => it.key))
      const next = [...prev]
      pendingVideoItems.forEach((it) => {
        if (existingKeys.has(it.key)) { try { URL.revokeObjectURL(it.previewUrl) } catch { } return }
        existingKeys.add(it.key)
        next.push({ ...it, caption: pendingVideoCaption || '' })
      })
      return next
    })
    setPendingVideoItems([])
    setPendingVideoCaption('')
  }

  const removeVideoItem = (key) => {
    setVideoItems((prev) => {
      const target = prev.find((it) => it.key === key)
      if (target?.previewUrl) try { URL.revokeObjectURL(target.previewUrl) } catch { }
      return prev.filter((it) => it.key !== key)
    })
  }

  const handleClose = () => {
    resetGalleryItems()
    resetVideoItems()
    setThumbnailFile(null)
    setReplaceImages(false)
    setReplaceVideos(false)
    setEditingId(null)
    setShowForm(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    try {
      const project = projects.find((p) => p.id === id)
      await apiService.deleteProject(project.slug)
      setProjects(projects.filter((p) => p.id !== id))
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
      data.append('project_type', formData.project_type || 'live')
      data.append('order', String(formData.order ?? 0))
      data.append('is_featured', String(!!formData.is_featured))
      data.append('is_published', String(!!formData.is_published))

      if (thumbnailFile) data.append('thumbnail', thumbnailFile)

      galleryItems.forEach((it) => {
        if (!it.file) return
        data.append('images', it.file)
        data.append('captions', it.caption || '')
      })
      if (editingId && replaceImages) data.append('replace_images', 'true')

      videoItems.forEach((it) => {
        if (!it.file) return
        data.append('videos', it.file)
        data.append('video_captions', it.caption || '')
      })
      if (editingId && replaceVideos) data.append('replace_videos', 'true')

      if (editingId) {
        const project = projects.find((p) => p.id === editingId)
        await apiService.updateProject(project.slug, data)
      } else {
        if (!thumbnailFile) { alert('Thumbnail is required'); return }
        await apiService.createProject(data)
      }

      handleClose()
      loadProjects()
    } catch (error) {
      console.error('Failed to save project:', error)
      if (error?.response?.data) console.error('Project save error response:', error.response.data)
      alert('Failed to save project')
    }
  }

  const columns = [
    {
      key: 'thumbnail',
      label: '',
      render: (val) => val
        ? <img src={val} alt="" className="table-thumb" />
        : <div className="table-thumb table-thumb--empty" />,
    },
    { key: 'title', label: 'Title' },
    {
      key: 'project_type',
      label: 'Type',
      render: (val) => (
        <span className={`badge ${val === 'live' ? 'badge--blue' : 'badge--purple'}`}>
          {val === 'live' ? 'Live' : 'Gallery'}
        </span>
      ),
    },
    {
      key: 'is_featured',
      label: 'Featured',
      render: (val) => (
        <span className={`badge ${val ? 'badge--orange' : 'badge--gray'}`}>{val ? 'Yes' : '—'}</span>
      ),
    },
    {
      key: 'is_published',
      label: 'Status',
      render: (val) => (
        <span className={`badge ${val ? 'badge--green' : 'badge--gray'}`}>{val ? 'Live' : 'Draft'}</span>
      ),
    },
  ]

  return (
    <div className="manager">
      <div className="manager-header">
        <h2>Projects</h2>
        <button className="btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Add Project
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
            label="GitHub Repo (optional)"
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
          />
          <FormField
            label="Project Type"
            name="project_type"
            type="select"
            value={formData.project_type || 'live'}
            onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
            options={[
              { value: 'live', label: 'Live Site / Web App' },
              { value: 'local', label: 'Local Project / Gallery' },
            ]}
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

          {/* ── Gallery images (local projects only) ── */}
          {formData.project_type === 'local' && (
            <div className="form-field">
              <label>Project Images</label>
              <div className="upload-zone">
                <input type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} />
              </div>

              {pendingGalleryItems.length > 0 && (
                <div className="pending-upload">
                  <div className="pending-upload__header">
                    <span>{pendingGalleryItems.length} image(s) selected</span>
                    <button type="button" className="btn-ghost-sm" onClick={() => { setPendingGalleryItems((p) => { revokeAll(p); return [] }); setPendingCaption('') }}>
                      Clear
                    </button>
                  </div>
                  <input
                    className="caption-input"
                    type="text"
                    value={pendingCaption}
                    onChange={(e) => setPendingCaption(e.target.value)}
                    placeholder="Caption for all selected images"
                  />
                  <div className="media-preview-grid">
                    {pendingGalleryItems.map((it) => (
                      <div key={it.key} className="media-preview-item">
                        <img src={it.previewUrl} alt="Preview" />
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-primary" onClick={commitPendingImages}>
                    Add images
                  </button>
                </div>
              )}

              {galleryItems.length > 0 && (
                <div className="committed-upload">
                  <div className="committed-upload__header">
                    <span>{galleryItems.length} image(s) queued</span>
                    <button type="button" className="btn-ghost-sm" onClick={resetGalleryItems}>Clear all</button>
                  </div>
                  <div className="media-grid">
                    {galleryItems.map((it) => (
                      <div key={it.key} className="media-card">
                        <div className="media-card__thumb">
                          <img src={it.previewUrl} alt="Selected" />
                        </div>
                        <button type="button" className="media-card__remove" onClick={() => removeGalleryItem(it.key)} aria-label="Remove">×</button>
                        {it.caption && <div className="media-card__caption">{it.caption}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {editingId && formData.project_type === 'local' && (
            <div className="replace-section">
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

          {/* ── Videos (local projects only) ── */}
          {formData.project_type === 'local' && (
            <div className="form-field">
              <label>Project Videos</label>
              <div className="upload-zone">
                <input type="file" accept="video/*" multiple onChange={handleVideoFilesChange} />
              </div>

              {pendingVideoItems.length > 0 && (
                <div className="pending-upload">
                  <div className="pending-upload__header">
                    <span>{pendingVideoItems.length} video(s) selected</span>
                    <button type="button" className="btn-ghost-sm" onClick={() => { setPendingVideoItems((p) => { revokeAll(p); return [] }); setPendingVideoCaption('') }}>
                      Clear
                    </button>
                  </div>
                  <input
                    className="caption-input"
                    type="text"
                    value={pendingVideoCaption}
                    onChange={(e) => setPendingVideoCaption(e.target.value)}
                    placeholder="Caption for all selected videos"
                  />
                  <div className="media-preview-grid">
                    {pendingVideoItems.map((it) => (
                      <div key={it.key} className="media-preview-item">
                        <video src={it.previewUrl} muted preload="metadata" />
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-primary" onClick={commitPendingVideos}>
                    Add videos
                  </button>
                </div>
              )}

              {videoItems.length > 0 && (
                <div className="committed-upload">
                  <div className="committed-upload__header">
                    <span>{videoItems.length} video(s) queued</span>
                    <button type="button" className="btn-ghost-sm" onClick={resetVideoItems}>Clear all</button>
                  </div>
                  <div className="media-grid">
                    {videoItems.map((it) => (
                      <div key={it.key} className="media-card">
                        <div className="media-card__thumb">
                          <video src={it.previewUrl} muted preload="metadata" />
                        </div>
                        <button type="button" className="media-card__remove" onClick={() => removeVideoItem(it.key)} aria-label="Remove">×</button>
                        {it.caption && <div className="media-card__caption">{it.caption}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {editingId && formData.project_type === 'local' && (
            <div className="replace-section">
              <label>
                <input
                  type="checkbox"
                  checked={replaceVideos}
                  onChange={(e) => setReplaceVideos(e.target.checked)}
                />
                Replace existing videos
              </label>
            </div>
          )}
        </ModalForm>
      )}
    </div>
  )
}
