import React, { useState, useEffect } from 'react'
import { Plus, Globe, Image, GalleryHorizontal, Film } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { FormField, ModalForm, Table } from './Form'
import './Manager.css'

export default function ProjectsManager() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    github_url: '',
    project_type: 'live',
    is_featured: false,
    is_published: true,
    order: 0,
    image_items: [],
    video_items: [],
    thumbnail: null,
  })

  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)

  // Single-step queues — files go here immediately on selection, no intermediate commit
  const [galleryItems, setGalleryItems] = useState([])
  const [replaceImages, setReplaceImages] = useState(false)

  const [videoItems, setVideoItems] = useState([])
  const [replaceVideos, setReplaceVideos] = useState(false)

  useEffect(() => { loadProjects() }, [])

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

  const revokeAll = (items) =>
    items.forEach((it) => { if (it.previewUrl) try { URL.revokeObjectURL(it.previewUrl) } catch { } })

  const resetMedia = () => {
    setGalleryItems((prev) => { revokeAll(prev); return [] })
    setVideoItems((prev) => { revokeAll(prev); return [] })
    if (thumbnailPreview) try { URL.revokeObjectURL(thumbnailPreview) } catch { }
    setThumbnailPreview(null)
    setThumbnailFile(null)
    setReplaceImages(false)
    setReplaceVideos(false)
  }

  const handleAdd = () => {
    resetMedia()
    setFormData({ title: '', description: '', url: '', github_url: '', project_type: 'live', is_featured: false, is_published: true, order: projects.length === 0 ? 1 : Math.max(...projects.map(p => p.order)) + 1, image_items: [], video_items: [], thumbnail: null })
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (project) => {
    resetMedia()
    setFormData({ ...project })
    setEditingId(project.id)
    setShowForm(true)
  }

  const handleClose = () => {
    resetMedia()
    setEditingId(null)
    setShowForm(false)
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0] || null
    if (thumbnailPreview) try { URL.revokeObjectURL(thumbnailPreview) } catch { }
    setThumbnailFile(file)
    setThumbnailPreview(file ? URL.createObjectURL(file) : null)
  }

  // ── Gallery images — files go straight into the queue ──
  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const newItems = files.map((file) => ({
      key: `${file.name}|${file.size}|${file.lastModified}`,
      file,
      previewUrl: URL.createObjectURL(file),
      caption: '',
    }))
    setGalleryItems((prev) => {
      const existingKeys = new Set(prev.map((it) => it.key))
      // revoke preview URLs for duplicates before discarding
      newItems.filter((it) => existingKeys.has(it.key)).forEach((it) => {
        try { URL.revokeObjectURL(it.previewUrl) } catch { }
      })
      return [...prev, ...newItems.filter((it) => !existingKeys.has(it.key))]
    })
    e.target.value = ''
  }

  const updateGalleryCaption = (key, caption) => {
    setGalleryItems((prev) => prev.map((it) => it.key === key ? { ...it, caption } : it))
  }

  const removeGalleryItem = (key) => {
    setGalleryItems((prev) => {
      const target = prev.find((it) => it.key === key)
      if (target?.previewUrl) try { URL.revokeObjectURL(target.previewUrl) } catch { }
      return prev.filter((it) => it.key !== key)
    })
  }

  // ── Videos — files go straight into the queue ──
  const handleVideoFilesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const newItems = files.map((file) => ({
      key: `${file.name}|${file.size}|${file.lastModified}`,
      file,
      previewUrl: URL.createObjectURL(file),
      caption: '',
    }))
    setVideoItems((prev) => {
      const existingKeys = new Set(prev.map((it) => it.key))
      newItems.filter((it) => existingKeys.has(it.key)).forEach((it) => {
        try { URL.revokeObjectURL(it.previewUrl) } catch { }
      })
      return [...prev, ...newItems.filter((it) => !existingKeys.has(it.key))]
    })
    e.target.value = ''
  }

  const updateVideoCaption = (key, caption) => {
    setVideoItems((prev) => prev.map((it) => it.key === key ? { ...it, caption } : it))
  }

  const removeVideoItem = (key) => {
    setVideoItems((prev) => {
      const target = prev.find((it) => it.key === key)
      if (target?.previewUrl) try { URL.revokeObjectURL(target.previewUrl) } catch { }
      return prev.filter((it) => it.key !== key)
    })
  }

  // ── Submit ──
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
    if (submitting) return
    setSubmitting(true)
    try {
      const targetOrder = formData.order
      const toShift = projects
        .filter(p => p.order >= targetOrder && p.id !== editingId)
        .sort((a, b) => b.order - a.order)
      for (const p of toShift) {
        await apiService.updateProject(p.slug, { order: p.order + 1 })
      }
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
        if (!thumbnailFile) { alert('Thumbnail is required'); setSubmitting(false); return }
        await apiService.createProject(data)
      }

      handleClose()
      loadProjects()
    } catch (error) {
      console.error('Failed to save project:', error)
      if (error?.response?.data) console.error('Save error:', error.response.data)
      alert('Failed to save project')
    } finally {
      setSubmitting(false)
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

  const existingImages = formData.image_items || []
  const existingVideos = formData.video_items || []
  const isLocal = formData.project_type === 'local'

  return (
    <div className="manager">
      <div className="manager-header">
        <div className="manager-header-left">
          <Globe size={22} color="#6366f1" />
          <h2>Projects</h2>
          {!loading && projects.length > 0 && (
            <span className="skill-count-badge">{projects.length}</span>
          )}
        </div>
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
          submitting={submitting}
        >
          {/* ── Basic Info ── */}
          <div className="form-section">
            <span className="form-section__label">Basic Info</span>
          </div>

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

          {/* ── Links ── */}
          <div className="form-section">
            <span className="form-section__label">Links</span>
          </div>

          <FormField
            label="Live URL"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://yourproject.com"
          />
          <FormField
            label="GitHub Repo"
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            placeholder="https://github.com/you/repo"
          />

          {/* ── Settings ── */}
          <div className="form-section">
            <span className="form-section__label">Settings</span>
          </div>

          <div className="form-field">
            <label>Project Type</label>
            <select
              value={formData.project_type}
              onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
            >
              <option value="live">Live Site / Web App</option>
              <option value="mobile">Mobile App</option>
              <option value="desktop">Desktop App</option>
              <option value="api">API / Backend</option>
              <option value="design">UI/UX Design</option>
              <option value="local">Local Project / Gallery</option>
            </select>
          </div>

          <FormField
            label="Display Order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          />

          <div className="form-field">
            <label>Visibility</label>
            <div className="toggle-row">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                <span className="toggle-track" />
                <span className="toggle-text">Published</span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                <span className="toggle-track" />
                <span className="toggle-text">Featured</span>
              </label>
            </div>
          </div>

          {/* ── Media ── */}
          <div className="form-section">
            <span className="form-section__label">Media</span>
          </div>

          {/* Thumbnail */}
          <div className="form-field">
            <label>
              Thumbnail {!editingId && <span className="required">*</span>}
            </label>
            <div className="thumb-upload-wrap">
              <div className={`thumb-preview-box ${!thumbnailPreview && !formData.thumbnail ? 'thumb-preview-box--empty' : ''}`}>
                {(thumbnailPreview || formData.thumbnail) ? (
                  <img src={thumbnailPreview || formData.thumbnail} alt="Thumbnail" />
                ) : (
                  <Image size={22} />
                )}
              </div>
              <div className="thumb-upload-controls">
                <input type="file" accept="image/*" onChange={handleThumbnailChange} />
                {thumbnailPreview && (
                  <button type="button" className="btn-ghost-sm" onClick={() => {
                    try { URL.revokeObjectURL(thumbnailPreview) } catch { }
                    setThumbnailPreview(null)
                    setThumbnailFile(null)
                  }}>
                    Remove selection
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Gallery images — local projects only */}
          {isLocal && (
            <div className="form-field">
              <label>Project Images</label>

              {editingId && existingImages.length > 0 && (
                <div className="existing-media">
                  <div className="existing-media__header">
                    <span className="existing-media__label">
                      <GalleryHorizontal size={14} />
                      {existingImages.length} current image{existingImages.length !== 1 ? 's' : ''}
                    </span>
                    <button type="button" className="btn-ghost-sm" onClick={() => setReplaceImages((v) => !v)}>
                      {replaceImages ? 'Keep existing' : 'Replace all'}
                    </button>
                  </div>
                  {replaceImages ? (
                    <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>
                      Existing images will be deleted when you save.
                    </p>
                  ) : (
                    <div className="media-grid media-grid--sm">
                      {existingImages.map((it) => (
                        <div key={it.id} className="media-card media-card--existing">
                          <div className="media-card__thumb">
                            <img src={it.image} alt={it.caption || ''} />
                          </div>
                          {it.caption && <div className="media-card__caption">{it.caption}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Picker — files go straight into the grid below */}
              <div className="upload-zone">
                <input type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} />
              </div>

              {galleryItems.length > 0 && (
                <div className="committed-upload">
                  <div className="committed-upload__header">
                    <span>{galleryItems.length} image{galleryItems.length !== 1 ? 's' : ''} queued for upload</span>
                    <button type="button" className="btn-ghost-sm" onClick={() => setGalleryItems((p) => { revokeAll(p); return [] })}>
                      Clear all
                    </button>
                  </div>
                  <div className="media-grid">
                    {galleryItems.map((it) => (
                      <div key={it.key} className="media-card">
                        <div className="media-card__thumb">
                          <img src={it.previewUrl} alt="Queued" />
                        </div>
                        <button type="button" className="media-card__remove" onClick={() => removeGalleryItem(it.key)} aria-label="Remove">×</button>
                        <input
                          className="media-card__caption-input"
                          type="text"
                          value={it.caption}
                          onChange={(e) => updateGalleryCaption(it.key, e.target.value)}
                          placeholder="Caption…"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Videos — local projects only */}
          {isLocal && (
            <div className="form-field">
              <label>Project Videos</label>

              {editingId && existingVideos.length > 0 && (
                <div className="existing-media">
                  <div className="existing-media__header">
                    <span className="existing-media__label">
                      <Film size={14} />
                      {existingVideos.length} current video{existingVideos.length !== 1 ? 's' : ''}
                    </span>
                    <button type="button" className="btn-ghost-sm" onClick={() => setReplaceVideos((v) => !v)}>
                      {replaceVideos ? 'Keep existing' : 'Replace all'}
                    </button>
                  </div>
                  {replaceVideos ? (
                    <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>
                      Existing videos will be deleted when you save.
                    </p>
                  ) : (
                    <div className="media-grid media-grid--sm">
                      {existingVideos.map((it) => (
                        <div key={it.id} className="media-card media-card--existing">
                          <div className="media-card__thumb">
                            <video src={it.video} muted preload="metadata" />
                          </div>
                          {it.caption && <div className="media-card__caption">{it.caption}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Picker — files go straight into the grid below */}
              <div className="upload-zone">
                <input type="file" accept="video/*" multiple onChange={handleVideoFilesChange} />
              </div>

              {videoItems.length > 0 && (
                <div className="committed-upload">
                  <div className="committed-upload__header">
                    <span>{videoItems.length} video{videoItems.length !== 1 ? 's' : ''} queued for upload</span>
                    <button type="button" className="btn-ghost-sm" onClick={() => setVideoItems((p) => { revokeAll(p); return [] })}>
                      Clear all
                    </button>
                  </div>
                  <div className="media-grid">
                    {videoItems.map((it) => (
                      <div key={it.key} className="media-card">
                        <div className="media-card__thumb">
                          <video src={it.previewUrl} muted preload="metadata" />
                        </div>
                        <button type="button" className="media-card__remove" onClick={() => removeVideoItem(it.key)} aria-label="Remove">×</button>
                        <input
                          className="media-card__caption-input"
                          type="text"
                          value={it.caption}
                          onChange={(e) => updateVideoCaption(it.key, e.target.value)}
                          placeholder="Caption…"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalForm>
      )}
    </div>
  )
}
