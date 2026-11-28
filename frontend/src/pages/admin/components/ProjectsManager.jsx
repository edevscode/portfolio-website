import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { Plus, Globe, Image, GalleryHorizontal, Film, Search, X } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { AdminToast, ConfirmDialog, FormField, ModalForm, Table } from './Form'
import './Manager.css'

const PROJECT_TYPE_OPTIONS = [
  { value: 'live',    label: 'Live Site / Web App' },
  { value: 'mobile',  label: 'Mobile App' },
  { value: 'desktop', label: 'Desktop App' },
  { value: 'api',     label: 'API / Backend' },
  { value: 'design',  label: 'UI/UX Design' },
  { value: 'local',   label: 'Local Project / Gallery' },
]

const PROJECT_TYPE_BADGE = {
  live:    { label: 'Live',    cls: 'badge--blue' },
  mobile:  { label: 'Mobile',  cls: 'badge--purple' },
  desktop: { label: 'Desktop', cls: 'badge--blue' },
  api:     { label: 'API',     cls: 'badge--gray' },
  design:  { label: 'Design',  cls: 'badge--orange' },
  local:   { label: 'Gallery', cls: 'badge--purple' },
}

export default function ProjectsManager() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingKey, setTogglingKey] = useState(null)
  const [reordering, setReordering] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

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

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiService.getProjects()
      setProjects(response.data)
    } catch (error) {
      console.error('Failed to load projects:', error)
      showToast('Failed to load projects', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadProjects()
    return () => clearTimeout(toastTimer.current)
  }, [loadProjects])

  const revokeAll = (items) =>
    items.forEach((it) => { if (it.previewUrl) try { URL.revokeObjectURL(it.previewUrl) } catch { /* noop */ } })

  const resetMedia = () => {
    setGalleryItems((prev) => { revokeAll(prev); return [] })
    setVideoItems((prev) => { revokeAll(prev); return [] })
    if (thumbnailPreview) try { URL.revokeObjectURL(thumbnailPreview) } catch { /* noop */ }
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
    if (thumbnailPreview) try { URL.revokeObjectURL(thumbnailPreview) } catch { /* noop */ }
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
        try { URL.revokeObjectURL(it.previewUrl) } catch { /* noop */ }
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
      if (target?.previewUrl) try { URL.revokeObjectURL(target.previewUrl) } catch { /* noop */ }
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
        try { URL.revokeObjectURL(it.previewUrl) } catch { /* noop */ }
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
      if (target?.previewUrl) try { URL.revokeObjectURL(target.previewUrl) } catch { /* noop */ }
      return prev.filter((it) => it.key !== key)
    })
  }

  // ── Submit ──
  const handleDelete = (id) => {
    setDeleteTargetId(id)
  }

  const confirmDelete = async () => {
    const project = projects.find((p) => p.id === deleteTargetId)
    if (!project) return
    setDeleting(true)
    try {
      await apiService.deleteProject(project.slug)
      setProjects((prev) => prev.filter((p) => p.id !== deleteTargetId))
      setDeleteTargetId(null)
      showToast('Project deleted')
    } catch (error) {
      console.error('Failed to delete project:', error)
      showToast('Failed to delete project', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!editingId && !thumbnailFile) {
      showToast('Thumbnail is required', 'error')
      return
    }
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
        showToast('Project updated')
      } else {
        await apiService.createProject(data)
        showToast('Project created')
      }

      handleClose()
      loadProjects()
    } catch (error) {
      console.error('Failed to save project:', error)
      if (error?.response?.data) console.error('Save error:', error.response.data)
      showToast('Failed to save project', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleField = async (project, field) => {
    const key = `${project.id}:${field}`
    if (togglingKey === key) return
    const nextVal = !project[field]
    setTogglingKey(key)
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, [field]: nextVal } : p)))
    try {
      await apiService.updateProject(project.slug, { [field]: nextVal })
      showToast(
        field === 'is_published'
          ? (nextVal ? `"${project.title}" published` : `"${project.title}" moved to draft`)
          : (nextVal ? `"${project.title}" marked featured` : `"${project.title}" removed from featured`)
      )
    } catch {
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, [field]: !nextVal } : p)))
      showToast('Failed to update project', 'error')
    } finally {
      setTogglingKey(null)
    }
  }

  const handleReorder = async (fromIdx, toIdx) => {
    if (reordering || toIdx < 0 || toIdx >= projects.length) return
    const nextList = [...projects]
    const [moved] = nextList.splice(fromIdx, 1)
    nextList.splice(toIdx, 0, moved)
    const normalized = nextList.map((p, idx) => ({ ...p, order: idx + 1 }))
    const prevList = projects
    setReordering(true)
    setProjects(normalized)
    try {
      const changed = normalized.filter((p) => {
        const prev = prevList.find((x) => x.id === p.id)
        return prev && prev.order !== p.order
      })
      for (const p of changed) {
        await apiService.updateProject(p.slug, { order: p.order })
      }
      showToast('Project order updated')
    } catch {
      setProjects(prevList)
      showToast('Failed to reorder projects', 'error')
    } finally {
      setReordering(false)
    }
  }

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase()
    return projects.filter((p) => {
      if (statusFilter === 'live' && !p.is_published) return false
      if (statusFilter === 'draft' && p.is_published) return false
      if (statusFilter === 'featured' && !p.is_featured) return false
      if (q && !(p.title || '').toLowerCase().includes(q) && !(p.project_type || '').toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [projects, search, statusFilter])

  const isFiltered = Boolean(search.trim() || statusFilter !== 'all')

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
      render: (val) => {
        const meta = PROJECT_TYPE_BADGE[val] || { label: val || 'Project', cls: 'badge--gray' }
        return <span className={`badge ${meta.cls}`}>{meta.label}</span>
      },
    },
    {
      key: 'is_featured',
      label: 'Featured',
      render: (val, row) => (
        <button
          type="button"
          className={`badge badge-toggle ${val ? 'badge--orange' : 'badge--gray'}`}
          onClick={() => handleToggleField(row, 'is_featured')}
          disabled={togglingKey === `${row.id}:is_featured`}
          title={val ? 'Click to unfeature' : 'Click to feature'}
          aria-pressed={!!val}
        >
          {val ? 'Featured' : 'Standard'}
        </button>
      ),
    },
    {
      key: 'is_published',
      label: 'Status',
      render: (val, row) => (
        <button
          type="button"
          className={`badge badge-toggle ${val ? 'badge--green' : 'badge--gray'}`}
          onClick={() => handleToggleField(row, 'is_published')}
          disabled={togglingKey === `${row.id}:is_published`}
          title={val ? 'Click to switch to Draft' : 'Click to publish Live'}
          aria-pressed={!!val}
        >
          {val ? 'Live' : 'Draft'}
        </button>
      ),
    },
  ]

  const existingImages = formData.image_items || []
  const existingVideos = formData.video_items || []
  const isLocal = formData.project_type === 'local'
  const deleteProject = projects.find((p) => p.id === deleteTargetId)

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
              placeholder="Search projects…"
              aria-label="Search projects"
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

          <div className="manager-filter-pills" role="group" aria-label="Filter projects">
            {[
              { id: 'all', label: 'All' },
              { id: 'live', label: 'Live' },
              { id: 'draft', label: 'Draft' },
              { id: 'featured', label: 'Featured' },
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                className={`manager-filter-pill${statusFilter === pill.id ? ' is-active' : ''}`}
                aria-pressed={statusFilter === pill.id}
                onClick={() => setStatusFilter(pill.id)}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {!loading && projects.length > 0 && (
            <span className="manager-result-meta">
              {isFiltered ? `${filteredProjects.length} of ${projects.length}` : `${projects.length} total`}
            </span>
          )}
        </div>

        <button type="button" className="btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Add Project
        </button>
      </div>

      <Table
        columns={columns}
        data={filteredProjects}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMoveUp={!isFiltered && projects.length > 1 ? (idx) => handleReorder(idx, idx - 1) : undefined}
        onMoveDown={!isFiltered && projects.length > 1 ? (idx) => handleReorder(idx, idx + 1) : undefined}
        reordering={reordering}
        loading={loading}
        emptyIcon={Globe}
        emptyText={isFiltered ? 'No matching projects' : 'No projects yet'}
        emptyDescription={
          isFiltered
            ? 'Try adjusting your search query or clearing active filters.'
            : 'Add your first project to showcase your work on the portfolio.'
        }
        emptyAction={
          isFiltered
            ? { label: 'Clear Filters', onClick: () => { setSearch(''); setStatusFilter('all') } }
            : { label: 'Add Project', onClick: handleAdd }
        }
      />

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
            type="markdown"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
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

          <div className="form-grid-2">
            <FormField
              label="Project Type"
              name="project_type"
              type="select"
              value={formData.project_type}
              onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
              options={PROJECT_TYPE_OPTIONS}
            />
            <FormField
              label="Display Order"
              name="order"
              type="number"
              min={0}
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
            />
          </div>

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
                    try { URL.revokeObjectURL(thumbnailPreview) } catch { /* noop */ }
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
                    <p className="manager-inline-warning">
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
                    <p className="manager-inline-warning">
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

      <ConfirmDialog
        open={!!deleteTargetId}
        title="Delete project?"
        message={deleteProject ? `Permanently delete "${deleteProject.title}"? This cannot be undone.` : 'This cannot be undone.'}
        confirmText="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
