const store = new Map()

export const cache = {
  get(key) {
    const entry = store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      return null
    }
    return entry.data
  },

  set(key, data, ttlMs) {
    store.set(key, { data, expiresAt: Date.now() + ttlMs })
  },

  has(key) {
    const entry = store.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      return false
    }
    return true
  },

  invalidate(key) {
    store.delete(key)
  },

  invalidateAll() {
    store.clear()
  },
}

// Cache key builders
export const CACHE_KEYS = {
  portfolio: 'portfolio:all',
  project: (slug) => `project:${String(slug)}`,
}

// TTL values
export const CACHE_TTL = {
  portfolio: 5 * 60 * 1000,   // 5 minutes
  project: 10 * 60 * 1000,    // 10 minutes
}
