import { supabase, SUPABASE_URL, MEDIA_BUCKET } from './supabaseClient'
import { cache, CACHE_KEYS, CACHE_TTL } from './cache'

// Kept exported for compatibility with components that normalize relative media URLs
export const API_BASE_URL = SUPABASE_URL || 'http://localhost:5173'

// ── Helpers ──────────────────────────────────────────────────────────────────

function throwApiError(error, fallbackStatus = 400) {
  const message =
    error?.message ||
    error?.error_description ||
    (typeof error === 'string' ? error : 'Request failed')
  const status =
    error?.status ||
    (error?.code === '42501'
      ? 403
      : error?.code === 'PGRST116' || error?.code === 'P0002'
        ? 404
        : fallbackStatus)
  const err = new Error(message)
  err.response = {
    status,
    statusText: message,
    data: { detail: message, error: message, code: error?.code },
  }
  throw err
}

function toBool(val, fallback = false) {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') {
    const lower = val.trim().toLowerCase()
    if (lower === 'true' || lower === '1' || lower === 'yes') return true
    if (lower === 'false' || lower === '0' || lower === 'no') return false
  }
  return fallback
}

function toInt(val, fallback = 0) {
  const n = Number(val)
  return Number.isFinite(n) ? Math.trunc(n) : fallback
}

function toFloat(val, fallback = 0) {
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

function emptyToNull(val) {
  if (val === undefined || val === null) return null
  if (typeof val === 'string' && val.trim() === '') return null
  return val
}

function detectFileType(filename) {
  const name = (filename || '').toLowerCase().split('?')[0]
  if (name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'word'
  return 'image'
}

function getCloudinaryResourceType(folder, file) {
  const name = (file?.name || '').toLowerCase()
  const mime = (file?.type || '').toLowerCase()
  if (
    folder === 'project_videos' ||
    mime.startsWith('video/') ||
    /\.(mp4|webm|mov|mkv|avi|m4v|ogv)$/i.test(name)
  ) {
    return 'video'
  }
  if (/\.(doc|docx|xls|xlsx|ppt|pptx|txt|zip)$/i.test(name)) {
    return 'raw'
  }
  // Images and PDFs use 'image' so PDFs serve inline as application/pdf with .pdf URL
  return 'image'
}

function buildPublicId(file, resourceType) {
  const rawName = (file?.name || 'file').trim()
  const dotIdx = rawName.lastIndexOf('.')
  const stem = (dotIdx > 0 ? rawName.slice(0, dotIdx) : rawName)
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'file'
  const ext = dotIdx > 0 ? rawName.slice(dotIdx).toLowerCase().replace(/[^a-z0-9.]/g, '') : ''
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${stem}`
  // Raw files must keep their extension in public_id; image/video append format automatically
  return resourceType === 'raw' ? `${unique}${ext}` : unique
}

const CLOUDINARY_CHUNK_SIZE = 20 * 1024 * 1024 // 20 MB per chunk for large videos

async function invokeCloudinarySign(body) {
  const { data, error } = await supabase.functions.invoke('cloudinary-sign', { body })
  if (error) {
    let detail = error.message || 'Cloudinary signing failed'
    try {
      const ctx = error.context
      if (ctx && typeof ctx.json === 'function') {
        const parsed = await ctx.json()
        if (parsed?.error) detail = parsed.error
      }
    } catch {
      // keep fallback message
    }
    throwApiError({ message: detail, status: error.context?.status || 500 }, 500)
  }
  if (data?.error) {
    throwApiError({ message: data.error, status: 400 }, 400)
  }
  return data
}

async function uploadMediaFile(folder, file) {
  const resourceType = getCloudinaryResourceType(folder, file)
  const cloudFolder = `media/${folder}`
  const publicId = buildPublicId(file, resourceType)

  const sig = await invokeCloudinarySign({
    action: 'upload',
    folder: cloudFolder,
    public_id: publicId,
  })
  if (!sig?.signature || !sig?.cloud_name) {
    throwApiError({ message: 'Failed to sign Cloudinary upload.', status: 500 }, 500)
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resourceType}/upload`

  // Chunked upload for large files (> 20 MB, e.g. portfolio videos up to 250 MB+)
  if (file.size > CLOUDINARY_CHUNK_SIZE) {
    const uploadId = `cl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    let finalJson = null

    for (let start = 0; start < file.size; start += CLOUDINARY_CHUNK_SIZE) {
      const end = Math.min(start + CLOUDINARY_CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)
      const fd = new FormData()
      fd.append('file', chunk, file.name)
      fd.append('api_key', sig.api_key)
      fd.append('timestamp', String(sig.timestamp))
      fd.append('folder', sig.folder)
      fd.append('public_id', sig.public_id)
      fd.append('signature', sig.signature)

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-Unique-Upload-Id': uploadId,
          'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
        },
        body: fd,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throwApiError(
          { message: json?.error?.message || `Cloudinary upload failed (${res.status})`, status: res.status },
          res.status
        )
      }
      finalJson = json
    }

    if (!finalJson?.secure_url) {
      throwApiError({ message: 'Cloudinary did not return a media URL.', status: 500 }, 500)
    }
    return finalJson.secure_url
  }

  // Standard single-request signed upload
  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', sig.api_key)
  fd.append('timestamp', String(sig.timestamp))
  fd.append('folder', sig.folder)
  fd.append('public_id', sig.public_id)
  fd.append('signature', sig.signature)

  const res = await fetch(endpoint, { method: 'POST', body: fd })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throwApiError(
      { message: json?.error?.message || `Cloudinary upload failed (${res.status})`, status: res.status },
      res.status
    )
  }
  if (!json?.secure_url) {
    throwApiError({ message: 'Cloudinary did not return a media URL.', status: 500 }, 500)
  }
  return json.secure_url
}

function parseCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return null
  const match = url.match(
    /^https?:\/\/res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\?.*)?$/i
  )
  if (!match) return null
  const resourceType = match[1].toLowerCase()
  let path = match[2]
  try {
    path = decodeURIComponent(path)
  } catch {
    // keep raw path
  }
  // Image & video public_ids exclude file extension; raw public_ids keep it
  const publicId = resourceType === 'raw' ? path : path.replace(/\.[^./]+$/, '')
  return { resourceType, publicId }
}

function extractSupabaseStoragePath(publicUrl) {
  if (!publicUrl || typeof publicUrl !== 'string') return null
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  const raw = publicUrl.slice(idx + marker.length).split('?')[0]
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

async function deleteStorageUrls(urls) {
  const list = (Array.isArray(urls) ? urls : [urls]).filter(Boolean)
  if (!list.length) return

  // 1. Clean up Cloudinary assets server-side via Edge Function (best-effort)
  const cloudItems = list.map(parseCloudinaryUrl).filter(Boolean)
  for (const item of cloudItems) {
    if (!item.publicId) continue
    try {
      await invokeCloudinarySign({
        action: 'destroy',
        public_id: item.publicId,
        resource_type: item.resourceType,
      })
    } catch {
      // Best-effort cleanup — never block DB delete
    }
  }

  // 2. Also clean up any legacy Supabase Storage URLs (best-effort)
  const sbPaths = list.map(extractSupabaseStoragePath).filter(Boolean)
  if (sbPaths.length) {
    try {
      await supabase.storage.from(MEDIA_BUCKET).remove(sbPaths)
    } catch {
      // Best-effort cleanup
    }
  }
}

function invalidatePortfolioCache(slug = null) {
  cache.invalidate(CACHE_KEYS.portfolio)
  if (slug) cache.invalidate(CACHE_KEYS.project(slug))
}

function isFormData(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData
}

function hasField(input, key) {
  return isFormData(input) ? input.has(key) : Object.prototype.hasOwnProperty.call(input || {}, key)
}

function getField(input, key) {
  return isFormData(input) ? input.get(key) : input?.[key]
}

function getAllFields(input, key) {
  if (isFormData(input)) return input.getAll(key)
  const val = input?.[key]
  if (Array.isArray(val)) return val
  return val !== undefined && val !== null ? [val] : []
}

// ── Select projections & normalizers ─────────────────────────────────────────

const PROJECT_SELECT =
  '*, image_items:project_images(id, image, caption, order, created_at), video_items:project_videos(id, video, caption, order, created_at)'

const CERT_SELECT =
  '*, files:certificate_files(id, file, file_type, caption, order)'

function normalizeProject(project) {
  if (!project) return project
  const image_items = Array.isArray(project.image_items)
    ? [...project.image_items].sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) ||
          new Date(a.created_at || 0) - new Date(b.created_at || 0)
      )
    : []
  const video_items = Array.isArray(project.video_items)
    ? [...project.video_items].sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) ||
          new Date(a.created_at || 0) - new Date(b.created_at || 0)
      )
    : []
  return { ...project, image_items, video_items }
}

function normalizeCertificate(cert) {
  if (!cert) return cert
  const files = Array.isArray(cert.files)
    ? [...cert.files].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.id ?? 0) - (b.id ?? 0))
    : []
  return { ...cert, files }
}

async function fetchProjectBySlugOrId(slugOrId) {
  const key = String(slugOrId)
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('slug', key)
    .maybeSingle()

  if (error) throwApiError(error)
  if (data) return normalizeProject(data)

  if (/^\d+$/.test(key)) {
    const { data: byId, error: byIdError } = await supabase
      .from('projects')
      .select(PROJECT_SELECT)
      .eq('id', Number(key))
      .maybeSingle()
    if (byIdError) throwApiError(byIdError)
    if (byId) return normalizeProject(byId)
  }

  throwApiError({ message: 'Project not found.', status: 404 }, 404)
}

// ── Visitor browser/device/geo helpers ───────────────────────────────────────

function parseDevice(ua) {
  const lower = (ua || '').toLowerCase()
  if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(lower)) return 'mobile'
  if (/tablet|ipad/.test(lower)) return 'tablet'
  return 'desktop'
}

function parseBrowser(ua) {
  const s = ua || ''
  if (s.includes('Edg/')) return 'Edge'
  if (s.includes('Firefox/')) return 'Firefox'
  if (s.includes('OPR/') || s.includes('Opera/')) return 'Opera'
  if (s.includes('Chrome/')) return 'Chrome'
  if (s.includes('Safari/')) return 'Safari'
  return 'Other'
}

async function fetchClientGeo() {
  const fetchWithTimeout = async (url, ms = 3500) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), ms)
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  // Primary: GeoJS (HTTPS, CORS-enabled, no API key required)
  const d1 = await fetchWithTimeout('https://get.geojs.io/v1/ip/geo.json')
  if (d1 && (d1.country || d1.country_code)) {
    return {
      ip: d1.ip || null,
      country: d1.country || '',
      country_code: d1.country_code || '',
      region: d1.region || '',
      city: d1.city || '',
    }
  }

  // Fallback: ipapi.co
  const d2 = await fetchWithTimeout('https://ipapi.co/json/')
  if (d2 && d2.country_name && !d2.error) {
    return {
      ip: d2.ip || null,
      country: d2.country_name || '',
      country_code: d2.country_code || '',
      region: d2.region || '',
      city: d2.city || '',
    }
  }

  return { ip: null, country: '', country_code: '', region: '', city: '' }
}

// ── Payload sanitizers ───────────────────────────────────────────────────────

function buildThemePayload(data, isUpdate = false) {
  const payload = {}
  const strFields = [
    'season',
    'name',
    'primary_color',
    'secondary_color',
    'accent_color',
    'background_color',
    'text_color',
    'animation_type',
    'particle_type',
    'card_style',
  ]
  strFields.forEach((k) => {
    if (hasField(data, k)) payload[k] = getField(data, k) ?? ''
  })

  const intFields = ['gradient_angle', 'shadow_intensity', 'border_radius', 'blur_effect']
  intFields.forEach((k) => {
    if (hasField(data, k)) payload[k] = toInt(getField(data, k), 0)
  })

  const floatFields = ['animation_duration', 'animation_delay']
  floatFields.forEach((k) => {
    if (hasField(data, k)) payload[k] = toFloat(getField(data, k), k === 'animation_duration' ? 1 : 0)
  })

  const boolFields = ['gradient_enabled', 'use_particles', 'use_hover_effects']
  boolFields.forEach((k) => {
    if (hasField(data, k)) payload[k] = toBool(getField(data, k))
  })

  // Only allow setting background_image if it's a string/null (File handled separately)
  if (hasField(data, 'background_image') && !(getField(data, 'background_image') instanceof File)) {
    payload.background_image = emptyToNull(getField(data, 'background_image'))
  }

  // Never overwrite is_active during regular theme edits (use activateTheme / setThemeAuto)
  if (!isUpdate && hasField(data, 'is_active')) {
    payload.is_active = toBool(getField(data, 'is_active'), false)
  }

  return payload
}

// ── Public API Service (Supabase-backed, preserves Axios { data } contract) ──

export const apiService = {
  // ── Auth ───────────────────────────────────────────────────────────────────
  checkAdmin: async () => {
    const { data, error } = await supabase.rpc('check_is_admin')
    if (error) return false
    return Boolean(data)
  },

  login: async (email, password) => {
    const trimmedEmail = (email || '').trim()
    if (!trimmedEmail || !password) {
      throwApiError({ message: 'Email and password are required.', status: 400 }, 400)
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })
    if (error) throwApiError(error, 401)

    const { data: isAdmin, error: adminErr } = await supabase.rpc('check_is_admin')
    if (adminErr || !isAdmin) {
      await supabase.auth.signOut()
      throwApiError(
        {
          message:
            'Only admin users can login. Ensure your email is registered in public.admin_users.',
          status: 403,
        },
        403
      )
    }

    return {
      data: {
        token: data.session?.access_token || '',
        user: {
          id: data.user.id,
          username: data.user.email,
          email: data.user.email,
          is_staff: true,
        },
      },
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
  },

  // ── Themes ─────────────────────────────────────────────────────────────────
  getThemes: async () => {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('season', { ascending: true })
      .order('id', { ascending: true })
    if (error) throwApiError(error)
    return { data: data || [] }
  },

  getTheme: async (id) => {
    const { data, error } = await supabase.from('themes').select('*').eq('id', id).single()
    if (error) throwApiError(error)
    return { data }
  },

  getCurrentTheme: async () => {
    const { data, error } = await supabase.rpc('get_current_theme')
    if (error) throwApiError(error)
    if (!data) throwApiError({ message: 'No theme configured.', status: 404 }, 404)
    return { data }
  },

  createTheme: async (input) => {
    const payload = buildThemePayload(input, false)
    if (hasField(input, 'background_image') && getField(input, 'background_image') instanceof File) {
      payload.background_image = await uploadMediaFile(
        'theme_backgrounds',
        getField(input, 'background_image')
      )
    }
    const { data, error } = await supabase.from('themes').insert(payload).select('*').single()
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data }
  },

  updateTheme: async (id, input) => {
    const payload = buildThemePayload(input, true)
    if (hasField(input, 'background_image') && getField(input, 'background_image') instanceof File) {
      payload.background_image = await uploadMediaFile(
        'theme_backgrounds',
        getField(input, 'background_image')
      )
    }
    const { data, error } = await supabase
      .from('themes')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data }
  },

  deleteTheme: async (id) => {
    const { data: existing } = await supabase
      .from('themes')
      .select('background_image')
      .eq('id', id)
      .maybeSingle()
    const { error } = await supabase.from('themes').delete().eq('id', id)
    if (error) throwApiError(error)
    if (existing?.background_image) await deleteStorageUrls(existing.background_image)
    invalidatePortfolioCache()
    return { data: null }
  },

  activateTheme: async (id) => {
    const { data, error } = await supabase.rpc('activate_theme', { p_theme_id: id })
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data }
  },

  setThemeAuto: async () => {
    const { data, error } = await supabase.rpc('set_theme_auto')
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data }
  },

  // ── Projects ───────────────────────────────────────────────────────────────
  getProjects: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(PROJECT_SELECT)
      .order('order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throwApiError(error)
    return { data: (data || []).map(normalizeProject) }
  },

  getFeaturedProjects: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(PROJECT_SELECT)
      .eq('is_featured', true)
      .eq('is_published', true)
      .order('order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throwApiError(error)
    return { data: (data || []).map(normalizeProject) }
  },

  getProject: async (slug) => {
    const project = await fetchProjectBySlugOrId(slug)
    return { data: project }
  },

  createProject: async (input) => {
    const payload = {
      title: String(getField(input, 'title') || '').trim(),
      description: String(getField(input, 'description') || ''),
      url: emptyToNull(getField(input, 'url')),
      github_url: emptyToNull(getField(input, 'github_url')),
      project_type: String(getField(input, 'project_type') || 'live'),
      order: toInt(getField(input, 'order'), 0),
      is_featured: toBool(getField(input, 'is_featured'), false),
      is_published: toBool(getField(input, 'is_published'), true),
    }

    if (hasField(input, 'slug') && emptyToNull(getField(input, 'slug'))) {
      payload.slug = String(getField(input, 'slug')).trim()
    }

    const thumb = getField(input, 'thumbnail')
    if (thumb instanceof File) {
      payload.thumbnail = await uploadMediaFile('project_thumbnails', thumb)
    } else if (typeof thumb === 'string' && thumb.trim()) {
      payload.thumbnail = thumb.trim()
    }

    const { data: created, error } = await supabase
      .from('projects')
      .insert(payload)
      .select('*')
      .single()
    if (error) throwApiError(error)

    // Upload & attach gallery images
    const imageFiles = getAllFields(input, 'images').filter((f) => f instanceof File)
    const imageCaptions = getAllFields(input, 'captions')
    if (imageFiles.length > 0) {
      const uploadedUrls = []
      const rows = []
      for (let i = 0; i < imageFiles.length; i++) {
        const url = await uploadMediaFile('project_images', imageFiles[i])
        uploadedUrls.push(url)
        rows.push({
          project_id: created.id,
          image: url,
          caption: String(imageCaptions[i] || ''),
          order: i,
        })
      }
      const { error: imgErr } = await supabase.from('project_images').insert(rows)
      if (imgErr) throwApiError(imgErr)
      await supabase.from('projects').update({ images: uploadedUrls }).eq('id', created.id)
    }

    // Upload & attach videos
    const videoFiles = getAllFields(input, 'videos').filter((f) => f instanceof File)
    const videoCaptions = getAllFields(input, 'video_captions')
    if (videoFiles.length > 0) {
      const rows = []
      for (let i = 0; i < videoFiles.length; i++) {
        const url = await uploadMediaFile('project_videos', videoFiles[i])
        rows.push({
          project_id: created.id,
          video: url,
          caption: String(videoCaptions[i] || ''),
          order: i,
        })
      }
      const { error: vidErr } = await supabase.from('project_videos').insert(rows)
      if (vidErr) throwApiError(vidErr)
    }

    const full = await fetchProjectBySlugOrId(created.slug)
    invalidatePortfolioCache(created.slug)
    return { data: full }
  },

  updateProject: async (slug, input) => {
    const existing = await fetchProjectBySlugOrId(slug)
    const payload = {}

    if (hasField(input, 'title')) payload.title = String(getField(input, 'title') || '').trim()
    if (hasField(input, 'description')) payload.description = String(getField(input, 'description') || '')
    if (hasField(input, 'url')) payload.url = emptyToNull(getField(input, 'url'))
    if (hasField(input, 'github_url')) payload.github_url = emptyToNull(getField(input, 'github_url'))
    if (hasField(input, 'project_type')) payload.project_type = String(getField(input, 'project_type') || 'live')
    if (hasField(input, 'order')) payload.order = toInt(getField(input, 'order'), existing.order ?? 0)
    if (hasField(input, 'is_featured')) payload.is_featured = toBool(getField(input, 'is_featured'))
    if (hasField(input, 'is_published')) payload.is_published = toBool(getField(input, 'is_published'))

    const oldThumb = existing.thumbnail
    let replacedThumb = false
    if (hasField(input, 'thumbnail')) {
      const thumb = getField(input, 'thumbnail')
      if (thumb instanceof File) {
        payload.thumbnail = await uploadMediaFile('project_thumbnails', thumb)
        replacedThumb = true
      }
    }

    if (Object.keys(payload).length > 0) {
      const { error } = await supabase.from('projects').update(payload).eq('id', existing.id)
      if (error) throwApiError(error)
      if (replacedThumb && oldThumb) await deleteStorageUrls(oldThumb)
    }

    // Handle gallery images
    const replaceImages = toBool(getField(input, 'replace_images'), false)
    const imageFiles = getAllFields(input, 'images').filter((f) => f instanceof File)
    const imageCaptions = getAllFields(input, 'captions')

    if (replaceImages) {
      const oldImgUrls = (existing.image_items || []).map((it) => it.image)
      const { error: delImgErr } = await supabase
        .from('project_images')
        .delete()
        .eq('project_id', existing.id)
      if (delImgErr) throwApiError(delImgErr)
      await deleteStorageUrls(oldImgUrls)
    }

    if (imageFiles.length > 0) {
      const startOrder = replaceImages ? 0 : (existing.image_items || []).length
      const rows = []
      for (let i = 0; i < imageFiles.length; i++) {
        const url = await uploadMediaFile('project_images', imageFiles[i])
        rows.push({
          project_id: existing.id,
          image: url,
          caption: String(imageCaptions[i] || ''),
          order: startOrder + i,
        })
      }
      const { error: imgErr } = await supabase.from('project_images').insert(rows)
      if (imgErr) throwApiError(imgErr)
    }

    if (replaceImages || imageFiles.length > 0) {
      const { data: latestImgs } = await supabase
        .from('project_images')
        .select('image')
        .eq('project_id', existing.id)
        .order('order', { ascending: true })
        .order('created_at', { ascending: true })
      await supabase
        .from('projects')
        .update({ images: (latestImgs || []).map((r) => r.image) })
        .eq('id', existing.id)
    }

    // Handle videos (replace only deletes once new files are present, matching prior behavior)
    const replaceVideos = toBool(getField(input, 'replace_videos'), false)
    const videoFiles = getAllFields(input, 'videos').filter((f) => f instanceof File)
    const videoCaptions = getAllFields(input, 'video_captions')

    if (videoFiles.length > 0) {
      if (replaceVideos) {
        const oldVidUrls = (existing.video_items || []).map((it) => it.video)
        const { error: delVidErr } = await supabase
          .from('project_videos')
          .delete()
          .eq('project_id', existing.id)
        if (delVidErr) throwApiError(delVidErr)
        await deleteStorageUrls(oldVidUrls)
      }

      const startOrder = replaceVideos ? 0 : (existing.video_items || []).length
      const rows = []
      for (let i = 0; i < videoFiles.length; i++) {
        const url = await uploadMediaFile('project_videos', videoFiles[i])
        rows.push({
          project_id: existing.id,
          video: url,
          caption: String(videoCaptions[i] || ''),
          order: startOrder + i,
        })
      }
      const { error: vidErr } = await supabase.from('project_videos').insert(rows)
      if (vidErr) throwApiError(vidErr)
    }

    const updated = await fetchProjectBySlugOrId(existing.slug)
    invalidatePortfolioCache(existing.slug)
    return { data: updated }
  },

  deleteProject: async (slug) => {
    const existing = await fetchProjectBySlugOrId(slug)
    const urlsToClean = [
      existing.thumbnail,
      ...(existing.image_items || []).map((it) => it.image),
      ...(existing.video_items || []).map((it) => it.video),
    ].filter(Boolean)

    const { error } = await supabase.from('projects').delete().eq('id', existing.id)
    if (error) throwApiError(error)

    await deleteStorageUrls(urlsToClean)
    invalidatePortfolioCache(existing.slug)
    return { data: null }
  },

  // ── Certificates ───────────────────────────────────────────────────────────
  getCertificates: async () => {
    const { data, error } = await supabase
      .from('certificates')
      .select(CERT_SELECT)
      .order('order', { ascending: true })
      .order('issue_date', { ascending: false })
    if (error) throwApiError(error)
    return { data: (data || []).map(normalizeCertificate) }
  },

  createCertificate: async (input) => {
    const payload = {
      title: String(getField(input, 'title') || '').trim(),
      issuer: String(getField(input, 'issuer') || '').trim(),
      description: String(getField(input, 'description') || ''),
      issue_date: String(getField(input, 'issue_date') || ''),
      expiry_date: emptyToNull(getField(input, 'expiry_date')),
      credential_id: String(getField(input, 'credential_id') || ''),
      credential_url: emptyToNull(getField(input, 'credential_url')),
      order: toInt(getField(input, 'order'), 0),
      is_featured: toBool(getField(input, 'is_featured'), false),
    }

    const { data: created, error } = await supabase
      .from('certificates')
      .insert(payload)
      .select('*')
      .single()
    if (error) throwApiError(error)

    const files = getAllFields(input, 'files').filter((f) => f instanceof File)
    const captions = getAllFields(input, 'file_captions')
    if (files.length > 0) {
      const rows = []
      for (let i = 0; i < files.length; i++) {
        const url = await uploadMediaFile('certificates', files[i])
        rows.push({
          certificate_id: created.id,
          file: url,
          file_type: detectFileType(files[i].name),
          caption: String(captions[i] || ''),
          order: i,
        })
      }
      const { error: fileErr } = await supabase.from('certificate_files').insert(rows)
      if (fileErr) throwApiError(fileErr)
    }

    const { data: full, error: fullErr } = await supabase
      .from('certificates')
      .select(CERT_SELECT)
      .eq('id', created.id)
      .single()
    if (fullErr) throwApiError(fullErr)

    invalidatePortfolioCache()
    return { data: normalizeCertificate(full) }
  },

  updateCertificate: async (id, input) => {
    const payload = {}
    if (hasField(input, 'title')) payload.title = String(getField(input, 'title') || '').trim()
    if (hasField(input, 'issuer')) payload.issuer = String(getField(input, 'issuer') || '').trim()
    if (hasField(input, 'description')) payload.description = String(getField(input, 'description') || '')
    if (hasField(input, 'issue_date')) payload.issue_date = String(getField(input, 'issue_date') || '')
    if (hasField(input, 'expiry_date')) payload.expiry_date = emptyToNull(getField(input, 'expiry_date'))
    if (hasField(input, 'credential_id')) payload.credential_id = String(getField(input, 'credential_id') || '')
    if (hasField(input, 'credential_url')) payload.credential_url = emptyToNull(getField(input, 'credential_url'))
    if (hasField(input, 'order')) payload.order = toInt(getField(input, 'order'), 0)
    if (hasField(input, 'is_featured')) payload.is_featured = toBool(getField(input, 'is_featured'))

    if (Object.keys(payload).length > 0) {
      const { error } = await supabase.from('certificates').update(payload).eq('id', id)
      if (error) throwApiError(error)
    }

    const replaceFiles = toBool(getField(input, 'replace_files'), false)
    const files = getAllFields(input, 'files').filter((f) => f instanceof File)
    const captions = getAllFields(input, 'file_captions')

    if (files.length > 0) {
      if (replaceFiles) {
        const { data: oldFiles } = await supabase
          .from('certificate_files')
          .select('file')
          .eq('certificate_id', id)
        await supabase.from('certificate_files').delete().eq('certificate_id', id)
        await deleteStorageUrls((oldFiles || []).map((f) => f.file))
      }

      const { count } = await supabase
        .from('certificate_files')
        .select('id', { count: 'exact', head: true })
        .eq('certificate_id', id)
      const start = count || 0

      const rows = []
      for (let i = 0; i < files.length; i++) {
        const url = await uploadMediaFile('certificates', files[i])
        rows.push({
          certificate_id: id,
          file: url,
          file_type: detectFileType(files[i].name),
          caption: String(captions[i] || ''),
          order: start + i,
        })
      }
      const { error: fileErr } = await supabase.from('certificate_files').insert(rows)
      if (fileErr) throwApiError(fileErr)
    }

    const { data: full, error: fullErr } = await supabase
      .from('certificates')
      .select(CERT_SELECT)
      .eq('id', id)
      .single()
    if (fullErr) throwApiError(fullErr)

    invalidatePortfolioCache()
    return { data: normalizeCertificate(full) }
  },

  deleteCertificate: async (id) => {
    const { data: existing } = await supabase
      .from('certificates')
      .select(CERT_SELECT)
      .eq('id', id)
      .maybeSingle()

    const { error } = await supabase.from('certificates').delete().eq('id', id)
    if (error) throwApiError(error)

    if (existing?.files?.length) {
      await deleteStorageUrls(existing.files.map((f) => f.file))
    }
    invalidatePortfolioCache()
    return { data: null }
  },

  deleteCertificateFile: async (id) => {
    const { data: existing } = await supabase
      .from('certificate_files')
      .select('file')
      .eq('id', id)
      .maybeSingle()

    const { error } = await supabase.from('certificate_files').delete().eq('id', id)
    if (error) throwApiError(error)

    if (existing?.file) await deleteStorageUrls(existing.file)
    invalidatePortfolioCache()
    return { data: null }
  },

  // ── Skills ─────────────────────────────────────────────────────────────────
  getSkills: async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('order', { ascending: true })
      .order('id', { ascending: true })
    if (error) throwApiError(error)
    return { data: data || [] }
  },

  getSkill: async (id) => {
    const { data, error } = await supabase.from('skills').select('*').eq('id', id).single()
    if (error) throwApiError(error)
    return { data }
  },

  createSkill: async (input) => {
    const payload = {
      name: String(getField(input, 'name') || '').trim(),
      proficiency: toInt(getField(input, 'proficiency'), 80),
      order: toInt(getField(input, 'order'), 0),
    }
    if (hasField(input, 'icon') && getField(input, 'icon') instanceof File) {
      payload.icon = await uploadMediaFile('skill_icons', getField(input, 'icon'))
    }
    const { data, error } = await supabase.from('skills').insert(payload).select('*').single()
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data }
  },

  updateSkill: async (id, input) => {
    const payload = {}
    if (hasField(input, 'name')) payload.name = String(getField(input, 'name') || '').trim()
    if (hasField(input, 'proficiency')) payload.proficiency = toInt(getField(input, 'proficiency'), 80)
    if (hasField(input, 'order')) payload.order = toInt(getField(input, 'order'), 0)
    if (hasField(input, 'icon') && getField(input, 'icon') instanceof File) {
      payload.icon = await uploadMediaFile('skill_icons', getField(input, 'icon'))
    }
    const { data, error } = await supabase
      .from('skills')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data }
  },

  deleteSkill: async (id) => {
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data: null }
  },

  // ── Experiences ────────────────────────────────────────────────────────────
  getExperiences: async () => {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('order', { ascending: true })
      .order('start_date', { ascending: false })
    if (error) throwApiError(error)
    return { data: data || [] }
  },

  getExperience: async (id) => {
    const { data, error } = await supabase.from('experiences').select('*').eq('id', id).single()
    if (error) throwApiError(error)
    return { data }
  },

  createExperience: async (input) => {
    const isCurrent = toBool(getField(input, 'is_current'), false)
    const payload = {
      title: String(getField(input, 'title') || '').trim(),
      company: String(getField(input, 'company') || ''),
      description: String(getField(input, 'description') || ''),
      start_date: String(getField(input, 'start_date') || ''),
      end_date: isCurrent ? null : emptyToNull(getField(input, 'end_date')),
      is_current: isCurrent,
      order: toInt(getField(input, 'order'), 0),
    }
    const { data, error } = await supabase.from('experiences').insert(payload).select('*').single()
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data }
  },

  updateExperience: async (id, input) => {
    const payload = {}
    if (hasField(input, 'title')) payload.title = String(getField(input, 'title') || '').trim()
    if (hasField(input, 'company')) payload.company = String(getField(input, 'company') || '')
    if (hasField(input, 'description')) payload.description = String(getField(input, 'description') || '')
    if (hasField(input, 'start_date')) payload.start_date = String(getField(input, 'start_date') || '')
    if (hasField(input, 'is_current')) payload.is_current = toBool(getField(input, 'is_current'))
    if (hasField(input, 'end_date')) {
      payload.end_date = payload.is_current ? null : emptyToNull(getField(input, 'end_date'))
    } else if (payload.is_current) {
      payload.end_date = null
    }
    if (hasField(input, 'order')) payload.order = toInt(getField(input, 'order'), 0)

    const { data, error } = await supabase
      .from('experiences')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data }
  },

  deleteExperience: async (id) => {
    const { error } = await supabase.from('experiences').delete().eq('id', id)
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data: null }
  },

  // ── About ──────────────────────────────────────────────────────────────────
  getAbout: async () => {
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
    if (error) throwApiError(error)
    return { data: data || [] }
  },

  createAbout: async (input) => {
    const textKeys = [
      'title',
      'hero_heading',
      'hero_subheading',
      'hero_name',
      'hero_role',
      'hero_tagline',
      'hero_cta_primary_text',
      'hero_cta_primary_link',
      'hero_cta_secondary_text',
      'hero_cta_secondary_link',
      'about_intro',
      'about_background',
      'about_specialization',
      'about_text',
      'bio',
      'phone',
      'location',
    ]
    const payload = { title: 'Profile' }
    textKeys.forEach((k) => {
      if (hasField(input, k)) payload[k] = String(getField(input, k) || '')
    })
    if (hasField(input, 'email')) payload.email = emptyToNull(getField(input, 'email'))

    const photo = getField(input, 'profile_image')
    if (photo instanceof File) {
      payload.profile_image = await uploadMediaFile('profile', photo)
    }
    const resume = getField(input, 'resume_file')
    if (resume instanceof File) {
      payload.resume_file = await uploadMediaFile('resume', resume)
    }

    const { data, error } = await supabase.from('about').insert(payload).select('*').single()
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data }
  },

  updateAbout: async (id, input) => {
    const { data: existing } = await supabase
      .from('about')
      .select('profile_image, resume_file')
      .eq('id', id)
      .maybeSingle()

    const textKeys = [
      'title',
      'hero_heading',
      'hero_subheading',
      'hero_name',
      'hero_role',
      'hero_tagline',
      'hero_cta_primary_text',
      'hero_cta_primary_link',
      'hero_cta_secondary_text',
      'hero_cta_secondary_link',
      'about_intro',
      'about_background',
      'about_specialization',
      'about_text',
      'bio',
      'phone',
      'location',
    ]
    const payload = {}
    textKeys.forEach((k) => {
      if (hasField(input, k)) payload[k] = String(getField(input, k) || '')
    })
    if (hasField(input, 'email')) payload.email = emptyToNull(getField(input, 'email'))

    let replacedPhoto = false
    let replacedResume = false
    if (hasField(input, 'profile_image') && getField(input, 'profile_image') instanceof File) {
      payload.profile_image = await uploadMediaFile('profile', getField(input, 'profile_image'))
      replacedPhoto = true
    }
    if (hasField(input, 'resume_file') && getField(input, 'resume_file') instanceof File) {
      payload.resume_file = await uploadMediaFile('resume', getField(input, 'resume_file'))
      replacedResume = true
    }

    const { data, error } = await supabase
      .from('about')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throwApiError(error)

    if (replacedPhoto && existing?.profile_image) await deleteStorageUrls(existing.profile_image)
    if (replacedResume && existing?.resume_file) await deleteStorageUrls(existing.resume_file)
    invalidatePortfolioCache()
    return { data }
  },

  // ── Social Links ───────────────────────────────────────────────────────────
  getSocialLinks: async () => {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('order', { ascending: true })
      .order('id', { ascending: true })
    if (error) throwApiError(error)
    return { data: data || [] }
  },

  createSocialLink: async (input) => {
    const payload = {
      platform: String(getField(input, 'platform') || '').trim(),
      url: String(getField(input, 'url') || '').trim(),
      icon: String(getField(input, 'icon') || ''),
      order: toInt(getField(input, 'order'), 0),
      is_visible: toBool(getField(input, 'is_visible'), true),
    }
    const { data, error } = await supabase.from('social_links').insert(payload).select('*').single()
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data }
  },

  updateSocialLink: async (id, input) => {
    const payload = {}
    if (hasField(input, 'platform')) payload.platform = String(getField(input, 'platform') || '').trim()
    if (hasField(input, 'url')) payload.url = String(getField(input, 'url') || '').trim()
    if (hasField(input, 'icon')) payload.icon = String(getField(input, 'icon') || '')
    if (hasField(input, 'order')) payload.order = toInt(getField(input, 'order'), 0)
    if (hasField(input, 'is_visible')) payload.is_visible = toBool(getField(input, 'is_visible'))

    const { data, error } = await supabase
      .from('social_links')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data }
  },

  deleteSocialLink: async (id) => {
    const { error } = await supabase.from('social_links').delete().eq('id', id)
    if (error) throwApiError(error)
    invalidatePortfolioCache()
    return { data: null }
  },

  // ── Contacts ───────────────────────────────────────────────────────────────
  getContacts: async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throwApiError(error)
    return { data: data || [] }
  },

  getContact: async (id) => {
    const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single()
    if (error) throwApiError(error)
    return { data }
  },

  createContact: async (input) => {
    const payload = {
      name: String(input?.name || '').trim(),
      email: String(input?.email || '').trim(),
      subject: String(input?.subject || '').trim(),
      message: String(input?.message || '').trim(),
      is_read: false,
    }
    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      throwApiError({ message: 'All fields are required.', status: 400 }, 400)
    }
    if (
      payload.name.length > 200 ||
      payload.email.length > 254 ||
      payload.subject.length > 300 ||
      payload.message.length > 5000
    ) {
      throwApiError({ message: 'One or more fields exceed the allowed length.', status: 400 }, 400)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      throwApiError({ message: 'Please enter a valid email address.', status: 400 }, 400)
    }

    // Do NOT chain .select() — anon role only has INSERT permission on contacts
    const { error } = await supabase.from('contacts').insert(payload)
    if (error) throwApiError(error)
    return { data: { status: 'created' } }
  },

  markContactAsRead: async (id) => {
    const { data, error } = await supabase
      .from('contacts')
      .update({ is_read: true })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throwApiError(error)
    return { data }
  },

  deleteContact: async (id) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) throwApiError(error)
    return { data: null }
  },

  // ── Visitors ───────────────────────────────────────────────────────────────
  logVisit: async (input = {}) => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
    const geo = await fetchClientGeo()
    const { data, error } = await supabase.rpc('log_visitor', {
      p_country: geo.country,
      p_country_code: geo.country_code,
      p_city: geo.city,
      p_region: geo.region,
      p_user_agent: ua,
      p_device_type: parseDevice(ua),
      p_browser: parseBrowser(ua),
      p_referrer: String(input?.referrer || '').slice(0, 500),
      p_ip_address: geo.ip,
    })
    if (error) throwApiError(error)
    return { data }
  },

  getRecentVisitors: async () => {
    const { data, error } = await supabase
      .from('visitors')
      .select('id, country, country_code, city, region, device_type, browser, referrer, visited_at')
      .order('visited_at', { ascending: false })
      .limit(50)
    if (error) throwApiError(error)
    return { data: data || [] }
  },

  getVisitorStats: async () => {
    const { data, error } = await supabase.rpc('get_visitor_stats')
    if (error) throwApiError(error)
    return {
      data: data || { total: 0, today: 0, countries: [], devices: [] },
    }
  },

  // ── Combined Public Portfolio ──────────────────────────────────────────────
  getPortfolio: async () => {
    const { data, error } = await supabase.rpc('get_public_portfolio')
    if (error) throwApiError(error)

    const portfolio = data || {
      about: null,
      projects: [],
      certificates: [],
      skills: [],
      experiences: [],
      social_links: [],
      current_theme: null,
    }

    // Hydrate per-project cache from the aggregated payload to avoid redundant fetches
    if (Array.isArray(portfolio.projects)) {
      portfolio.projects.forEach((p) => {
        const key = String(p.slug || p.id)
        if (key) cache.set(CACHE_KEYS.project(key), p, CACHE_TTL.project)
      })
    }

    return { data: portfolio }
  },
}

export default supabase
