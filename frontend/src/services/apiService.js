import axios from 'axios'

function normalizeApiBaseUrl(raw) {
  if (!raw || typeof raw !== 'string') return 'http://localhost:8000/api'
  let value = raw.trim()

  if (value.startsWith(':')) {
    value = `http://localhost${value}`
  }

  if (/^(localhost|127\.0\.0\.1)/i.test(value)) {
    value = `http://${value}`
  }

  if (!/^https?:\/\//i.test(value)) {
    value = `http://${value}`
  }

  value = value.replace(/\/+$/, '')
  return value
}

export const API_BASE_URL = normalizeApiBaseUrl(
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL)) ||
    'http://localhost:8000/api'
)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  // If we're sending FormData (files / multipart), don't force JSON.
  // Let Axios set the correct multipart boundary header.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers && config.headers['Content-Type']) {
      delete config.headers['Content-Type']
    }
  }
  return config
})

export const apiService = {
  // Auth
  login: (username, password) =>
    api.post('/auth/login/', { username, password }),
  logout: () => {
    localStorage.removeItem('adminToken')
    return Promise.resolve()
  },

  // Themes
  getThemes: () => api.get('/themes/'),
  getTheme: (id) => api.get(`/themes/${id}/`),
  getCurrentTheme: () => api.get('/themes/current/'),
  createTheme: (data) => api.post('/themes/', data),
  updateTheme: (id, data) => api.patch(`/themes/${id}/`, data),
  deleteTheme: (id) => api.delete(`/themes/${id}/`),
  activateTheme: (id) => api.post(`/themes/${id}/activate/`),
  setThemeAuto: () => api.post('/themes/auto/'),

  // Projects
  getProjects: () => api.get('/projects/'),
  getFeaturedProjects: () => api.get('/projects/featured/'),
  getProject: (slug) => api.get(`/projects/${slug}/`),
  createProject: (data) => api.post('/projects/', data),
  updateProject: (slug, data) => api.patch(`/projects/${slug}/`, data),
  deleteProject: (slug) => api.delete(`/projects/${slug}/`),

  // Skills
  getSkills: () => api.get('/skills/'),
  getSkill: (id) => api.get(`/skills/${id}/`),
  createSkill: (data) => api.post('/skills/', data),
  updateSkill: (id, data) => api.patch(`/skills/${id}/`, data),
  deleteSkill: (id) => api.delete(`/skills/${id}/`),

  // Experiences
  getExperiences: () => api.get('/experiences/'),
  getExperience: (id) => api.get(`/experiences/${id}/`),
  createExperience: (data) => api.post('/experiences/', data),
  updateExperience: (id, data) => api.patch(`/experiences/${id}/`, data),
  deleteExperience: (id) => api.delete(`/experiences/${id}/`),

  // About
  getAbout: () => api.get('/about/me/'),
  createAbout: (data) => api.post('/about/', data),
  updateAbout: (id, data) => api.patch(`/about/${id}/`, data),

  // Social Links
  getSocialLinks: () => api.get('/social-links/'),
  createSocialLink: (data) => api.post('/social-links/', data),
  updateSocialLink: (id, data) => api.patch(`/social-links/${id}/`, data),
  deleteSocialLink: (id) => api.delete(`/social-links/${id}/`),

  // Contacts
  getContacts: () => api.get('/contacts/'),
  getContact: (id) => api.get(`/contacts/${id}/`),
  createContact: (data) => api.post('/contacts/', data),
  markContactAsRead: (id) => api.post(`/contacts/${id}/mark_as_read/`),

  // Portfolio
  getPortfolio: () => api.get('/portfolio/all/'),
}

export default api
