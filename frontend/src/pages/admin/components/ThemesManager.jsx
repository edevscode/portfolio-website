import React, { useState, useEffect, useId, useMemo, useRef } from 'react'
import { Plus, Info, Check, Palette, ChevronDown, Search, X } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { cache, CACHE_KEYS } from '../../../services/cache'
import { getContrastRatio, resolveThemeTokens } from '../../../utils/color'
import { AdminToast, FormField, ModalForm } from './Form'
import './Manager.css'
import './Themes.css'

const SEASON_OPTIONS = [
  { value: 'spring',       label: 'Spring' },
  { value: 'summer',       label: 'Summer' },
  { value: 'autumn',       label: 'Autumn' },
  { value: 'winter',       label: 'Winter' },
  { value: 'new_year',     label: 'New Year (Jan 1–7)' },
  { value: 'valentine',    label: "Valentine's Day (Feb 10–18)" },
  { value: 'easter',       label: 'Easter (Apr–May)' },
  { value: 'halloween',    label: 'Halloween (Oct 25–31)' },
  { value: 'thanksgiving', label: 'Thanksgiving (Late Nov)' },
  { value: 'christmas',    label: 'Christmas (Dec 20–31)' },
  { value: 'cny',          label: 'Chinese New Year' },
  { value: 'default',      label: 'Default' },
]

const ANIMATION_OPTIONS = [
  { value: 'none',     label: 'None' },
  { value: 'fade',     label: 'Fade In' },
  { value: 'slide',    label: 'Slide In' },
  { value: 'bounce',   label: 'Bounce' },
  { value: 'glow',     label: 'Glow Effect' },
  { value: 'float',    label: 'Float' },
  { value: 'pulse',    label: 'Pulse' },
  { value: 'gradient', label: 'Gradient Shift' },
]

const PARTICLE_OPTIONS = [
  { value: 'none',   label: 'None' },
  { value: 'snow',   label: 'Falling Snow' },
  { value: 'leaves', label: 'Falling Leaves' },
  { value: 'stars',  label: 'Twinkling Stars' },
]

const CARD_STYLE_OPTIONS = [
  { value: 'flat',     label: 'Flat' },
  { value: 'elevated', label: 'Elevated' },
  { value: 'outlined', label: 'Outlined' },
]

const PRESET_THEMES = [
  {
    name: 'Winter Wonderland', season: 'winter',
    primary_color: '#1a472a', secondary_color: '#e8f4f8', accent_color: '#4da6ff',
    background_color: '#f0f8ff', text_color: '#1a472a',
    gradient_enabled: true, gradient_angle: 45, shadow_intensity: 5,
    border_radius: 12, blur_effect: 2, animation_type: 'float', animation_duration: 3,
    animation_delay: 0, use_particles: true, particle_type: 'snow',
    use_hover_effects: true, card_style: 'elevated',
  },
  {
    name: 'Christmas Festive', season: 'christmas',
    primary_color: '#c41e3a', secondary_color: '#fff8dc', accent_color: '#ffd700',
    background_color: '#f0f8ff', text_color: '#165b33',
    gradient_enabled: true, gradient_angle: 135, shadow_intensity: 8,
    border_radius: 10, blur_effect: 0, animation_type: 'glow', animation_duration: 2,
    animation_delay: 0, use_particles: true, particle_type: 'stars',
    use_hover_effects: true, card_style: 'elevated',
  },
  {
    name: 'New Year Celebration', season: 'new_year',
    primary_color: '#1a1a2e', secondary_color: '#ffd700', accent_color: '#ff006e',
    background_color: '#0f3460', text_color: '#ffd700',
    gradient_enabled: true, gradient_angle: 45, shadow_intensity: 6,
    border_radius: 15, blur_effect: 1, animation_type: 'bounce', animation_duration: 1.5,
    animation_delay: 0, use_particles: true, particle_type: 'stars',
    use_hover_effects: true, card_style: 'outlined',
  },
  {
    name: "Valentine's Day", season: 'valentine',
    primary_color: '#c71585', secondary_color: '#ffe4e1', accent_color: '#ff1493',
    background_color: '#fff0f5', text_color: '#8b0000',
    gradient_enabled: true, gradient_angle: 45, shadow_intensity: 4,
    border_radius: 20, blur_effect: 3, animation_type: 'pulse', animation_duration: 2,
    animation_delay: 0, use_particles: false, particle_type: 'none',
    use_hover_effects: true, card_style: 'elevated',
  },
  {
    name: 'Spring Bloom', season: 'spring',
    primary_color: '#2d6a4f', secondary_color: '#fff1e6', accent_color: '#d62828',
    background_color: '#f5fbf0', text_color: '#1b4332',
    gradient_enabled: true, gradient_angle: 90, shadow_intensity: 3,
    border_radius: 18, blur_effect: 2, animation_type: 'slide', animation_duration: 1.2,
    animation_delay: 0, use_particles: false, particle_type: 'none',
    use_hover_effects: true, card_style: 'flat',
  },
  {
    name: 'Summer Vibes', season: 'summer',
    primary_color: '#004e89', secondary_color: '#fff9e6', accent_color: '#f77f00',
    background_color: '#fffbf0', text_color: '#1a1a1a',
    gradient_enabled: true, gradient_angle: 135, shadow_intensity: 2,
    border_radius: 8, blur_effect: 0, animation_type: 'fade', animation_duration: 1,
    animation_delay: 0, use_particles: false, particle_type: 'none',
    use_hover_effects: true, card_style: 'flat',
  },
  {
    name: 'Autumn Warmth', season: 'autumn',
    primary_color: '#5c4033', secondary_color: '#fff5e1', accent_color: '#d2691e',
    background_color: '#faf6f1', text_color: '#3e2723',
    gradient_enabled: true, gradient_angle: 45, shadow_intensity: 5,
    border_radius: 12, blur_effect: 2, animation_type: 'float', animation_duration: 3,
    animation_delay: 0, use_particles: true, particle_type: 'leaves',
    use_hover_effects: true, card_style: 'elevated',
  },
  {
    name: 'Halloween Spooky', season: 'halloween',
    primary_color: '#2d1b4e', secondary_color: '#f4e4d7', accent_color: '#ff6b35',
    background_color: '#1a0f2e', text_color: '#ff6b35',
    gradient_enabled: true, gradient_angle: 180, shadow_intensity: 7,
    border_radius: 6, blur_effect: 4, animation_type: 'glow', animation_duration: 2.5,
    animation_delay: 0, use_particles: false, particle_type: 'none',
    use_hover_effects: true, card_style: 'outlined',
  },
  {
    name: 'Thanksgiving', season: 'thanksgiving',
    primary_color: '#6b4423', secondary_color: '#fff8f0', accent_color: '#d4491f',
    background_color: '#fff5e6', text_color: '#4a2c1a',
    gradient_enabled: true, gradient_angle: 45, shadow_intensity: 4,
    border_radius: 10, blur_effect: 1, animation_type: 'fade', animation_duration: 1.5,
    animation_delay: 0, use_particles: false, particle_type: 'none',
    use_hover_effects: true, card_style: 'elevated',
  },
  {
    name: 'Chinese New Year', season: 'cny',
    primary_color: '#c41e3a', secondary_color: '#ffd700', accent_color: '#dc143c',
    background_color: '#fff8dc', text_color: '#8b0000',
    gradient_enabled: true, gradient_angle: 90, shadow_intensity: 6,
    border_radius: 14, blur_effect: 0, animation_type: 'bounce', animation_duration: 1.8,
    animation_delay: 0, use_particles: true, particle_type: 'stars',
    use_hover_effects: true, card_style: 'elevated',
  },
  {
    name: 'Minimalist', season: 'default',
    primary_color: '#333333', secondary_color: '#ffffff', accent_color: '#0066cc',
    background_color: '#f5f5f5', text_color: '#333333',
    gradient_enabled: false, gradient_angle: 45, shadow_intensity: 0,
    border_radius: 4, blur_effect: 0, animation_type: 'none', animation_duration: 1,
    animation_delay: 0, use_particles: false, particle_type: 'none',
    use_hover_effects: true, card_style: 'flat',
  },
  {
    name: 'Vibrant Modern', season: 'default',
    primary_color: '#6c5ce7', secondary_color: '#a29bfe', accent_color: '#00b894',
    background_color: '#f8f9fa', text_color: '#2d3436',
    gradient_enabled: true, gradient_angle: 45, shadow_intensity: 5,
    border_radius: 12, blur_effect: 2, animation_type: 'pulse', animation_duration: 2,
    animation_delay: 0, use_particles: false, particle_type: 'none',
    use_hover_effects: true, card_style: 'elevated',
  },
  {
    name: 'Luxury Dark', season: 'default',
    primary_color: '#1a1a1a', secondary_color: '#d4af37', accent_color: '#b8860b',
    background_color: '#0d0d0d', text_color: '#e8e8e8',
    gradient_enabled: true, gradient_angle: 135, shadow_intensity: 8,
    border_radius: 8, blur_effect: 1, animation_type: 'fade', animation_duration: 1.2,
    animation_delay: 0, use_particles: false, particle_type: 'none',
    use_hover_effects: true, card_style: 'outlined',
  },
]

// Live mini-portfolio preview inside the edit form
function ThemePreview({ f }) {
  const t = resolveThemeTokens(f)
  const rawRatio = getContrastRatio(f.text_color, f.background_color)
  const nativePass = rawRatio !== null && rawRatio >= 4.5

  return (
    <div
      className="theme-preview"
      style={{ backgroundColor: t.bg, borderColor: t.border }}
    >
      <div className="theme-preview-topbar" style={{ borderBottomColor: t.border }}>
        <div className="theme-preview-brand">
          <span className="theme-preview-dot" style={{ background: t.accent }} />
          <span className="theme-preview-label" style={{ color: t.textMuted }}>
            Mini Portfolio Preview
          </span>
        </div>
        <span
          className={`theme-wcag-pill${nativePass ? ' theme-wcag-pill--pass' : ' theme-wcag-pill--auto'}`}
          title={
            nativePass
              ? `Raw text/background contrast ratio is ${rawRatio.toFixed(1)}:1 (meets WCAG AA)`
              : 'Raw text/background contrast is below 4.5:1; semantic tokens auto-adjust viewer readability'
          }
        >
          {nativePass ? `WCAG AA ${rawRatio.toFixed(1)}:1` : 'Auto-adjusted AA'}
        </span>
      </div>

      <div className="theme-preview-hero">
        <div className="theme-preview-hero-title" style={{ color: t.heading }}>
          {f.name?.trim() || 'Portfolio Heading'}
        </div>
        <div className="theme-preview-hero-ctas">
          <span className="theme-preview-accent" style={{ background: t.accent, color: t.onAccent }}>
            View Work
          </span>
          <span
            className="theme-preview-ghost"
            style={{ color: t.heading, borderColor: t.borderStrong }}
          >
            Contact
          </span>
        </div>
      </div>

      <div
        className="theme-preview-card"
        style={{ backgroundColor: t.surface, borderColor: t.surfaceBorder }}
      >
        <h4 style={{ color: t.headingOnSurface }}>Featured Project</h4>
        <p style={{ color: t.surfaceText }}>
          Surface card contrast and body copy preview for your portfolio sections.
        </p>
      </div>
    </div>
  )
}

// Range input that shows its current value inline
function RangeField({ label, value, onChange, min = 0, max = 10, step = 1, unit = '' }) {
  const id = useId()
  return (
    <div className="range-field">
      <div className="range-field__header">
        <label htmlFor={id} className="range-field__label">{label}</label>
        <span className="range-field__value">{value}{unit}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={onChange} />
    </div>
  )
}

const SEASON_LABEL = Object.fromEntries(SEASON_OPTIONS.map(o => [o.value, o.label]))
const SEASON_SELECT_OPTIONS = [{ value: '', label: '— Select —' }, ...SEASON_OPTIONS]

const COLOR_FIELDS = [
  ['Primary', 'primary_color'],
  ['Secondary', 'secondary_color'],
  ['Accent', 'accent_color'],
  ['Background', 'background_color'],
  ['Text', 'text_color'],
]

export default function ThemesManager() {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeMode, setActiveMode] = useState('auto')
  const [showInfo, setShowInfo] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [applyingTheme, setApplyingTheme] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const presetTitleId = useId()
  const [formData, setFormData] = useState({
    season: '',
    name: '',
    primary_color: '#000000',
    secondary_color: '#ffffff',
    accent_color: '#0066cc',
    background_color: '#f5f5f5',
    text_color: '#333333',
  })

  useEffect(() => {
    loadThemes()
    return () => clearTimeout(toastTimer.current)
  }, [])

  useEffect(() => {
    if (!selectedPreset) return undefined
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !applyingTheme) {
        setSelectedPreset(null)
      }
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedPreset, applyingTheme])

  const showToast = (message, type = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  const invalidatePortfolioCache = () => {
    cache.invalidate(CACHE_KEYS.portfolio)
    window.dispatchEvent(new CustomEvent('admin:meta-updated'))
  }

  const loadThemes = async () => {
    try {
      setLoading(true)
      const response = await apiService.getThemes()
      setThemes(response.data)
      setActiveMode(response.data.some(t => t.is_active) ? 'manual' : 'auto')
    } catch (error) {
      console.error('Failed to load themes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({
      season: '', name: '',
      primary_color: '#000000', secondary_color: '#ffffff',
      accent_color: '#0066cc', background_color: '#f5f5f5', text_color: '#333333',
      gradient_enabled: false, gradient_angle: 45, shadow_intensity: 0,
      border_radius: 0, blur_effect: 0, animation_type: 'none',
      animation_duration: 1, animation_delay: 0, use_particles: false,
      particle_type: 'none', use_hover_effects: true, card_style: 'flat',
    })
    setEditingId(null)
    setShowForm(true)
  }

  const handleApplyPreset = (preset) => {
    setFormData(preset)
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (theme) => {
    setFormData(theme)
    setEditingId(theme.id)
    setDeletingId(null)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      await apiService.deleteTheme(id)
      setThemes(themes.filter(t => t.id !== id))
      setDeletingId(null)
      invalidatePortfolioCache()
      showToast('Theme deleted')
    } catch {
      showToast('Failed to delete theme', 'error')
    }
  }

  const handleActivate = async (id) => {
    try {
      await apiService.activateTheme(id)
      setActiveMode('manual')
      invalidatePortfolioCache()
      loadThemes()
      showToast('Theme activated — portfolio updated')
    } catch {
      showToast('Failed to activate theme', 'error')
    }
  }

  const handleApplyPresetDirect = async (activate = false) => {
    if (!selectedPreset) return
    setApplyingTheme(true)
    try {
      const themeData = {
        season: selectedPreset.season || '',
        name: selectedPreset.name || '',
        primary_color: selectedPreset.primary_color || '#000000',
        secondary_color: selectedPreset.secondary_color || '#ffffff',
        accent_color: selectedPreset.accent_color || '#0066cc',
        background_color: selectedPreset.background_color || '#f5f5f5',
        text_color: selectedPreset.text_color || '#333333',
        gradient_enabled: Boolean(selectedPreset.gradient_enabled),
        gradient_angle: parseInt(selectedPreset.gradient_angle) || 45,
        shadow_intensity: parseInt(selectedPreset.shadow_intensity) || 0,
        border_radius: parseInt(selectedPreset.border_radius) || 0,
        blur_effect: parseInt(selectedPreset.blur_effect) || 0,
        animation_type: selectedPreset.animation_type || 'none',
        animation_duration: parseFloat(selectedPreset.animation_duration) || 1,
        animation_delay: parseFloat(selectedPreset.animation_delay) || 0,
        use_particles: Boolean(selectedPreset.use_particles),
        particle_type: selectedPreset.particle_type || 'none',
        use_hover_effects: Boolean(selectedPreset.use_hover_effects !== false),
        card_style: selectedPreset.card_style || 'flat',
      }

      const response = await apiService.createTheme(themeData)
      const newThemeId = response.data.id

      if (activate) {
        await apiService.activateTheme(newThemeId)
        setActiveMode('manual')
        showToast(`"${selectedPreset.name}" created and activated`)
      } else {
        showToast(`"${selectedPreset.name}" theme created`)
      }

      invalidatePortfolioCache()
      setSelectedPreset(null)
      loadThemes()
    } catch (error) {
      console.error('Theme creation error:', error.response?.data)
      showToast('Failed to apply theme: ' + (error.response?.data?.detail || error.message), 'error')
    } finally {
      setApplyingTheme(false)
    }
  }

  const handleSetAuto = async () => {
    try {
      await apiService.setThemeAuto()
      setActiveMode('auto')
      invalidatePortfolioCache()
      loadThemes()
      showToast('Switched to automatic seasonal themes', 'info')
    } catch {
      showToast('Failed to switch to auto mode', 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!formData.season || !formData.name) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    setSubmitting(true)
    try {
      if (editingId) {
        await apiService.updateTheme(editingId, formData)
        showToast('Theme updated')
      } else {
        await apiService.createTheme(formData)
        showToast('Theme created')
      }
      invalidatePortfolioCache()
      setShowForm(false)
      loadThemes()
    } catch (error) {
      showToast('Failed to save theme: ' + (error.response?.data?.detail || error.message), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const getSeasonLabel = (season) => SEASON_LABEL[season] || season
  const activeTheme = themes.find(t => t.is_active)
  const presetTokens = selectedPreset ? resolveThemeTokens(selectedPreset) : null

  const filteredThemes = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return themes
    return themes.filter(
      (t) =>
        (t.name || '').toLowerCase().includes(q) ||
        (SEASON_LABEL[t.season] || t.season || '').toLowerCase().includes(q)
    )
  }, [themes, search])

  return (
    <div className="manager">
      {/* Header */}
      <div className="manager-header">
        <div className="manager-header-left">
          <Palette size={17} className="manager-header-icon" />
          <h2>Saved Themes</h2>
          {!loading && themes.length > 0 && (
            <span className="count-badge">{themes.length}</span>
          )}
          <button
            type="button"
            className={`themes-info-btn${showInfo ? ' active' : ''}`}
            onClick={() => setShowInfo(!showInfo)}
            title="How seasonal themes work"
            aria-label="How seasonal themes work"
            aria-expanded={showInfo}
          >
            <Info size={15} />
          </button>
        </div>
        <div className="manager-header-actions">
          <button
            type="button"
            className={activeMode === 'auto' ? 'btn-primary' : 'btn-secondary'}
            onClick={handleSetAuto}
            title="Enable automatic seasonal theme switching"
          >
            {activeMode === 'auto' && <Check size={15} />}
            {activeMode === 'auto' ? 'Auto Mode' : 'Use Auto Mode'}
          </button>
          <button type="button" className="btn-primary" onClick={handleAdd}>
            <Plus size={16} /> Add Theme
          </button>
        </div>
      </div>

      <div className="themes-top-section">
        {/* Info panel */}
        {showInfo && (
          <div className="info-panel">
            <strong>Seasonal Themes</strong> — themes switch automatically based on the calendar date.
            <ul>
              <li><strong>Auto Mode:</strong> The system picks the best-matching theme for the current season — no manual steps needed.</li>
              <li><strong>Manual Mode:</strong> Activate any theme to lock it indefinitely; it won't change until you switch back to Auto.</li>
              <li>Changing or activating a theme immediately clears the portfolio cache so visitors see the update.</li>
            </ul>
          </div>
        )}

        {/* Mode banner */}
        <div className={`mode-banner mode-banner--${activeMode}`}>
          <span className="mode-banner__dot" aria-hidden="true" />
          <span className="mode-banner__text">
            {activeMode === 'auto'
              ? 'Auto Mode — theme changes automatically with the season'
              : activeTheme
                ? `Manual Mode — "${activeTheme.name}" is active`
                : 'Manual Mode active'}
          </span>
        </div>

        {/* Preset Templates */}
        <div className="preset-section">
          <h3>Quick Templates</h3>
          <div className="preset-grid">
            {PRESET_THEMES.map((preset, i) => {
              const pt = resolveThemeTokens(preset)
              return (
                <button
                  type="button"
                  key={i}
                  className="preset-btn"
                  onClick={() => setSelectedPreset(preset)}
                  title={`Preview and apply ${preset.name}`}
                  style={{
                    background: pt.bg,
                    color: pt.text,
                    borderColor: pt.borderStrong,
                  }}
                >
                  <span className="preset-btn__name">{preset.name}</span>
                  <div className="preset-btn__dots">
                    <span className="preset-btn__dot" style={{ background: preset.primary_color }} />
                    <span className="preset-btn__dot" style={{ background: preset.accent_color }} />
                    <span className="preset-btn__dot" style={{ background: preset.secondary_color }} />
                  </div>
                </button>
              )
            })}
          </div>
          <p className="preset-section__hint">
            Click a template to preview, customize, or apply it directly.
          </p>
        </div>

        {/* Saved theme search bar when list has > 4 themes */}
        {!loading && themes.length > 4 && (
          <div className="themes-search-bar">
            <div className="manager-search">
              <Search size={14} className="manager-search__icon" aria-hidden="true" />
              <input
                type="search"
                className="manager-search__input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved themes…"
                aria-label="Search saved themes"
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
            {search.trim() && (
              <span className="manager-result-meta">
                {filteredThemes.length} of {themes.length}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Theme Cards */}
      <div className="themes-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="theme-skeleton">
                <div className="theme-skeleton__head">
                  <div className="skeleton-line" style={{ height: 17, width: '55%' }} />
                  <div className="skeleton-line" style={{ height: 17, width: '25%' }} />
                </div>
                <div className="skeleton-line" style={{ height: 11, width: '35%', marginBottom: 14 }} />
                <div className="theme-skeleton__swatches">
                  {[0,1,2,3,4].map(j => (
                    <div key={j} className="skeleton-line" style={{ width: 26, height: 26, borderRadius: 6 }} />
                  ))}
                </div>
                <div className="skeleton-line" style={{ height: 33, borderRadius: 8 }} />
              </div>
            ))
          : filteredThemes.map((theme) => {
              const t = resolveThemeTokens(theme)
              return (
                <div
                  key={theme.id}
                  className={`theme-card${theme.is_active ? ' theme-card--active' : ''}`}
                  style={{
                    background: t.bg,
                    color: t.text,
                    borderColor: theme.is_active ? t.accent : t.borderStrong,
                  }}
                >
                  {/* Name + Active badge */}
                  <div className="theme-card__header">
                    <h3 className="theme-card__name" style={{ color: t.heading }}>
                      {theme.name}
                    </h3>
                    {theme.is_active && (
                      <span
                        className="theme-card__active-badge"
                        style={{
                          background: t.isDarkBg ? 'rgba(34, 197, 94, 0.22)' : 'rgba(22, 163, 74, 0.14)',
                          color: t.isDarkBg ? '#86efac' : '#15803d',
                        }}
                      >
                        <Check size={10} /> Active
                      </span>
                    )}
                  </div>

                  <p className="theme-card__season" style={{ color: t.textMuted }}>
                    {getSeasonLabel(theme.season)}
                  </p>

                  {/* All 5 raw colors */}
                  <div className="theme-card__colors">
                    {[
                      [theme.primary_color, 'Primary'],
                      [theme.secondary_color, 'Secondary'],
                      [theme.accent_color, 'Accent'],
                      [theme.background_color, 'Background'],
                      [theme.text_color, 'Text'],
                    ].map(([color, label]) => (
                      <div
                        key={label}
                        className="color-swatch"
                        style={{ background: color }}
                        title={`${label}: ${color}`}
                      />
                    ))}
                  </div>

                  {/* Feature badges */}
                  <div className="theme-card__badges">
                    {theme.gradient_enabled && (
                      <span
                        className="theme-card__badge"
                        style={{ background: t.tint, color: t.text, borderColor: t.border }}
                      >
                        Gradient
                      </span>
                    )}
                    {theme.use_particles && theme.particle_type !== 'none' && (
                      <span
                        className="theme-card__badge"
                        style={{ background: t.tint, color: t.text, borderColor: t.border }}
                      >
                        {PARTICLE_OPTIONS.find(p => p.value === theme.particle_type)?.label || 'Particles'}
                      </span>
                    )}
                    {theme.animation_type && theme.animation_type !== 'none' && (
                      <span
                        className="theme-card__badge"
                        style={{ background: t.tint, color: t.text, borderColor: t.border }}
                      >
                        {ANIMATION_OPTIONS.find(a => a.value === theme.animation_type)?.label || 'Animation'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="theme-card__actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(theme)}
                      style={{ color: t.heading, background: t.tint, borderColor: t.border }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActivate(theme.id)}
                      disabled={theme.is_active}
                      style={
                        theme.is_active
                          ? { color: t.textMuted, background: t.tint, borderColor: t.border }
                          : { color: t.onAccent, background: t.accent, borderColor: t.accent }
                      }
                    >
                      {theme.is_active ? 'Active' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(deletingId === theme.id ? null : theme.id)}
                      style={{
                        color: t.isDarkBg ? '#fca5a5' : '#b91c1c',
                        background: t.isDarkBg ? 'rgba(239, 68, 68, 0.18)' : 'rgba(220, 38, 38, 0.08)',
                        borderColor: t.isDarkBg ? 'rgba(248, 113, 113, 0.3)' : 'rgba(220, 38, 38, 0.16)',
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  {/* Inline delete confirm */}
                  {deletingId === theme.id && (
                    <div
                      className="theme-card__confirm"
                      style={{
                        background: t.isDarkBg ? 'rgba(239, 68, 68, 0.16)' : 'rgba(220, 38, 38, 0.06)',
                        borderColor: t.isDarkBg ? 'rgba(248, 113, 113, 0.35)' : 'rgba(220, 38, 38, 0.2)',
                      }}
                    >
                      <span style={{ color: t.isDarkBg ? '#fecaca' : '#991b1b' }}>
                        Delete this theme?
                      </span>
                      <button
                        type="button"
                        className="theme-card__confirm-no"
                        style={{
                          background: t.tint,
                          color: t.text,
                        }}
                        onClick={() => setDeletingId(null)}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        className="theme-card__confirm-yes"
                        onClick={() => handleDelete(theme.id)}
                      >
                        Yes
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
      </div>

      {!loading && themes.length > 0 && filteredThemes.length === 0 && (
        <div className="themes-empty">
          <p>No saved themes match &ldquo;{search}&rdquo;.</p>
          <button type="button" className="btn-secondary" onClick={() => setSearch('')}>
            Clear Search
          </button>
        </div>
      )}

      {!loading && themes.length === 0 && (
        <div className="themes-empty">
          <p>No themes yet. Use a Quick Template above or create a custom theme.</p>
          <button type="button" className="btn-primary" onClick={handleAdd}>
            <Plus size={15} /> Create First Theme
          </button>
        </div>
      )}

      {/* Preset Modal */}
      {selectedPreset && presetTokens && (
        <div
          className="preset-modal-overlay"
          onClick={() => { if (!applyingTheme) setSelectedPreset(null) }}
        >
          <div
            className="preset-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={presetTitleId}
            onClick={e => e.stopPropagation()}
          >
            <h2 id={presetTitleId}>Apply &ldquo;{selectedPreset.name}&rdquo;</h2>
            <p>Choose how to apply this template to your portfolio.</p>

            <div
              className="preset-modal-preview"
              style={{
                background: presetTokens.bg,
                color: presetTokens.text,
                borderLeftColor: presetTokens.accent,
                borderColor: presetTokens.border,
              }}
            >
              <div className="preset-modal-preview__colors">
                {[
                  [selectedPreset.primary_color, 'Primary'],
                  [selectedPreset.secondary_color, 'Secondary'],
                  [selectedPreset.accent_color, 'Accent'],
                  [selectedPreset.background_color, 'Background'],
                  [selectedPreset.text_color, 'Text'],
                ].map(([c, label]) => (
                  <div
                    key={label}
                    className="preset-modal-preview__swatch"
                    style={{ background: c }}
                    title={`${label}: ${c}`}
                  />
                ))}
              </div>
              <div className="preset-modal-preview__meta" style={{ color: presetTokens.textMuted }}>
                <strong>Season:</strong> {getSeasonLabel(selectedPreset.season)}
                {selectedPreset.animation_type !== 'none' && (
                  <>&nbsp;&nbsp;<strong>Animation:</strong> {ANIMATION_OPTIONS.find(a => a.value === selectedPreset.animation_type)?.label}</>
                )}
                {selectedPreset.use_particles && selectedPreset.particle_type !== 'none' && (
                  <>&nbsp;&nbsp;<strong>Particles:</strong> {PARTICLE_OPTIONS.find(p => p.value === selectedPreset.particle_type)?.label}</>
                )}
              </div>
            </div>

            <div className="preset-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setSelectedPreset(null)}
                disabled={applyingTheme}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-customize"
                onClick={() => { handleApplyPreset(selectedPreset); setSelectedPreset(null) }}
                disabled={applyingTheme}
              >
                Customize
              </button>
              <button
                type="button"
                className="btn-create"
                onClick={() => handleApplyPresetDirect(false)}
                disabled={applyingTheme}
              >
                {applyingTheme ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                className="btn-activate"
                onClick={() => handleApplyPresetDirect(true)}
                disabled={applyingTheme}
              >
                {applyingTheme ? 'Applying…' : 'Create & Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Form */}
      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Theme' : 'Add Theme'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          submitting={submitting}
        >
          <div className="themes-form-scroll">
            {/* Live preview */}
            <ThemePreview f={formData} />

            <div className="form-section themes-form-section--first">
              <span className="form-section__label">Basic</span>
            </div>

            <div className="form-grid-2">
              <FormField
                label="Theme Name"
                name="theme-name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Winter Frost, Summer Vibes"
                required
              />
              <FormField
                label="Season"
                name="theme-season"
                type="select"
                value={formData.season}
                onChange={e => setFormData({ ...formData, season: e.target.value })}
                options={SEASON_SELECT_OPTIONS}
                required
              />
            </div>

            <div className="form-section">
              <span className="form-section__label">Colors</span>
            </div>

            <div className="color-picker-grid">
              {COLOR_FIELDS.map(([label, key]) => {
                const value = formData[key] || '#000000'
                return (
                  <label key={key} className="color-picker-card">
                    <input
                      type="color"
                      className="color-picker-input"
                      value={value}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      aria-label={`${label} color`}
                    />
                    <span className="color-picker-meta">
                      <span className="color-picker-label">{label}</span>
                      <span className="color-picker-hex">{value.toUpperCase()}</span>
                    </span>
                  </label>
                )
              })}
            </div>

            <details className="themes-advanced">
              <summary className="themes-advanced__summary">
                <span>Advanced &amp; Decorative Effects</span>
                <ChevronDown size={15} className="themes-advanced__chevron" aria-hidden="true" />
              </summary>
              <div className="themes-advanced__body">
                <div className="form-section themes-form-section--first">
                  <span className="form-section__label">Visual Effects</span>
                </div>

                <RangeField
                  label="Shadow Intensity"
                  value={formData.shadow_intensity ?? 0}
                  min={0} max={10}
                  onChange={e => setFormData({ ...formData, shadow_intensity: +e.target.value })}
                />
                <RangeField
                  label="Border Radius"
                  value={formData.border_radius ?? 0}
                  min={0} max={50} unit="px"
                  onChange={e => setFormData({ ...formData, border_radius: +e.target.value })}
                />
                <RangeField
                  label="Blur Effect"
                  value={formData.blur_effect ?? 0}
                  min={0} max={20} unit="px"
                  onChange={e => setFormData({ ...formData, blur_effect: +e.target.value })}
                />

                <div className="themes-check-group">
                  <label className="themes-check-label">
                    <input
                      type="checkbox"
                      checked={formData.gradient_enabled || false}
                      onChange={e => setFormData({ ...formData, gradient_enabled: e.target.checked })}
                    />
                    <span>Enable Gradient Background</span>
                  </label>
                  {formData.gradient_enabled && (
                    <div className="themes-nested-control">
                      <RangeField
                        label="Gradient Angle"
                        value={formData.gradient_angle ?? 45}
                        min={0} max={360} unit="°"
                        onChange={e => setFormData({ ...formData, gradient_angle: +e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <span className="form-section__label">Animations</span>
                </div>

                <FormField
                  label="Animation Type"
                  name="animation_type"
                  type="select"
                  value={formData.animation_type || 'none'}
                  onChange={e => setFormData({ ...formData, animation_type: e.target.value })}
                  options={ANIMATION_OPTIONS}
                />

                {formData.animation_type && formData.animation_type !== 'none' && (
                  <div className="form-grid-2">
                    <FormField
                      label="Duration (seconds)"
                      name="animation_duration"
                      type="number"
                      min="0.5" max="5" step="0.5"
                      value={formData.animation_duration ?? 1}
                      onChange={e => setFormData({ ...formData, animation_duration: parseFloat(e.target.value) || 1 })}
                    />
                    <FormField
                      label="Delay (seconds)"
                      name="animation_delay"
                      type="number"
                      min="0" max="2" step="0.5"
                      value={formData.animation_delay ?? 0}
                      onChange={e => setFormData({ ...formData, animation_delay: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}

                <div className="form-section">
                  <span className="form-section__label">Decorative Effects</span>
                </div>

                <div className="themes-check-group">
                  <label className="themes-check-label">
                    <input
                      type="checkbox"
                      checked={formData.use_particles || false}
                      onChange={e => setFormData({ ...formData, use_particles: e.target.checked })}
                    />
                    <span>Enable Particle Effects</span>
                  </label>
                  {formData.use_particles && (
                    <div className="themes-nested-control">
                      <FormField
                        label="Particle Type"
                        name="particle_type"
                        type="select"
                        value={formData.particle_type || 'none'}
                        onChange={e => setFormData({ ...formData, particle_type: e.target.value })}
                        options={PARTICLE_OPTIONS}
                      />
                    </div>
                  )}
                </div>

                <div className="themes-check-group">
                  <label className="themes-check-label">
                    <input
                      type="checkbox"
                      checked={formData.use_hover_effects !== false}
                      onChange={e => setFormData({ ...formData, use_hover_effects: e.target.checked })}
                    />
                    <span>Enable Hover Effects</span>
                  </label>
                </div>

                <FormField
                  label="Card Style"
                  name="card_style"
                  type="select"
                  value={formData.card_style || 'flat'}
                  onChange={e => setFormData({ ...formData, card_style: e.target.value })}
                  options={CARD_STYLE_OPTIONS}
                />
              </div>
            </details>
          </div>
        </ModalForm>
      )}

      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
