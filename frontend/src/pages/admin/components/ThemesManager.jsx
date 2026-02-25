import React, { useState, useEffect } from 'react'
import { Plus, Info } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import { FormField, ModalForm, Table } from './Form'
import './Manager.css'
import './Themes.css'

const SEASON_OPTIONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'winter', label: 'Winter' },
  { value: 'new_year', label: 'New Year (Jan 1-7)' },
  { value: 'valentine', label: "Valentine's Day (Feb 10-18)" },
  { value: 'easter', label: 'Easter (Apr-May)' },
  { value: 'halloween', label: 'Halloween (Oct 25-31)' },
  { value: 'thanksgiving', label: 'Thanksgiving (Late Nov)' },
  { value: 'christmas', label: 'Christmas (Dec 20-31)' },
  { value: 'cny', label: 'Chinese New Year' },
  { value: 'default', label: 'Default' },
]

const ANIMATION_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade In' },
  { value: 'slide', label: 'Slide In' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'glow', label: 'Glow Effect' },
  { value: 'float', label: 'Float' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'gradient', label: 'Gradient Shift' },
]

const PARTICLE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'snow', label: 'Falling Snow' },
  { value: 'leaves', label: 'Falling Leaves' },
  { value: 'stars', label: 'Twinkling Stars' },
]

const CARD_STYLE_OPTIONS = [
  { value: 'flat', label: 'Flat' },
  { value: 'elevated', label: 'Elevated' },
  { value: 'outlined', label: 'Outlined' },
]

const PRESET_THEMES = [
  {
    name: 'Winter Wonderland',
    season: 'winter',
    primary_color: '#1a472a',
    secondary_color: '#e8f4f8',
    accent_color: '#4da6ff',
    background_color: '#f0f8ff',
    text_color: '#1a472a',
    gradient_enabled: true,
    gradient_angle: 45,
    shadow_intensity: 5,
    border_radius: 12,
    blur_effect: 2,
    animation_type: 'float',
    animation_duration: 3,
    animation_delay: 0,
    use_particles: true,
    particle_type: 'snow',
    use_hover_effects: true,
    card_style: 'elevated',
  },
  {
    name: 'Christmas Festive',
    season: 'christmas',
    primary_color: '#c41e3a',
    secondary_color: '#fff8dc',
    accent_color: '#ffd700',
    background_color: '#f0f8ff',
    text_color: '#165b33',
    gradient_enabled: true,
    gradient_angle: 135,
    shadow_intensity: 8,
    border_radius: 10,
    blur_effect: 0,
    animation_type: 'glow',
    animation_duration: 2,
    animation_delay: 0,
    use_particles: true,
    particle_type: 'stars',
    use_hover_effects: true,
    card_style: 'elevated',
  },
  {
    name: 'New Year Celebration',
    season: 'new_year',
    primary_color: '#1a1a2e',
    secondary_color: '#ffd700',
    accent_color: '#ff006e',
    background_color: '#0f3460',
    text_color: '#ffd700',
    gradient_enabled: true,
    gradient_angle: 45,
    shadow_intensity: 6,
    border_radius: 15,
    blur_effect: 1,
    animation_type: 'bounce',
    animation_duration: 1.5,
    animation_delay: 0,
    use_particles: true,
    particle_type: 'stars',
    use_hover_effects: true,
    card_style: 'outlined',
  },
  {
    name: "Valentine's Day",
    season: 'valentine',
    primary_color: '#c71585',
    secondary_color: '#ffe4e1',
    accent_color: '#ff1493',
    background_color: '#fff0f5',
    text_color: '#8b0000',
    gradient_enabled: true,
    gradient_angle: 45,
    shadow_intensity: 4,
    border_radius: 20,
    blur_effect: 3,
    animation_type: 'pulse',
    animation_duration: 2,
    animation_delay: 0,
    use_particles: false,
    particle_type: 'none',
    use_hover_effects: true,
    card_style: 'elevated',
  },
  {
    name: 'Spring Bloom',
    season: 'spring',
    primary_color: '#2d6a4f',
    secondary_color: '#fff1e6',
    accent_color: '#d62828',
    background_color: '#f5fbf0',
    text_color: '#1b4332',
    gradient_enabled: true,
    gradient_angle: 90,
    shadow_intensity: 3,
    border_radius: 18,
    blur_effect: 2,
    animation_type: 'slide',
    animation_duration: 1.2,
    animation_delay: 0,
    use_particles: false,
    particle_type: 'none',
    use_hover_effects: true,
    card_style: 'flat',
  },
  {
    name: 'Summer Vibes',
    season: 'summer',
    primary_color: '#004e89',
    secondary_color: '#fff9e6',
    accent_color: '#f77f00',
    background_color: '#fffbf0',
    text_color: '#1a1a1a',
    gradient_enabled: true,
    gradient_angle: 135,
    shadow_intensity: 2,
    border_radius: 8,
    blur_effect: 0,
    animation_type: 'fade',
    animation_duration: 1,
    animation_delay: 0,
    use_particles: false,
    particle_type: 'none',
    use_hover_effects: true,
    card_style: 'flat',
  },
  {
    name: 'Autumn Warmth',
    season: 'autumn',
    primary_color: '#5c4033',
    secondary_color: '#fff5e1',
    accent_color: '#d2691e',
    background_color: '#faf6f1',
    text_color: '#3e2723',
    gradient_enabled: true,
    gradient_angle: 45,
    shadow_intensity: 5,
    border_radius: 12,
    blur_effect: 2,
    animation_type: 'float',
    animation_duration: 3,
    animation_delay: 0,
    use_particles: true,
    particle_type: 'leaves',
    use_hover_effects: true,
    card_style: 'elevated',
  },
  {
    name: 'Halloween Spooky',
    season: 'halloween',
    primary_color: '#2d1b4e',
    secondary_color: '#f4e4d7',
    accent_color: '#ff6b35',
    background_color: '#1a0f2e',
    text_color: '#ff6b35',
    gradient_enabled: true,
    gradient_angle: 180,
    shadow_intensity: 7,
    border_radius: 6,
    blur_effect: 4,
    animation_type: 'glow',
    animation_duration: 2.5,
    animation_delay: 0,
    use_particles: false,
    particle_type: 'none',
    use_hover_effects: true,
    card_style: 'outlined',
  },
  {
    name: 'Thanksgiving Gratitude',
    season: 'thanksgiving',
    primary_color: '#6b4423',
    secondary_color: '#fff8f0',
    accent_color: '#d4491f',
    background_color: '#fff5e6',
    text_color: '#4a2c1a',
    gradient_enabled: true,
    gradient_angle: 45,
    shadow_intensity: 4,
    border_radius: 10,
    blur_effect: 1,
    animation_type: 'fade',
    animation_duration: 1.5,
    animation_delay: 0,
    use_particles: false,
    particle_type: 'none',
    use_hover_effects: true,
    card_style: 'elevated',
  },
  {
    name: 'Chinese New Year',
    season: 'cny',
    primary_color: '#c41e3a',
    secondary_color: '#ffd700',
    accent_color: '#dc143c',
    background_color: '#fff8dc',
    text_color: '#8b0000',
    gradient_enabled: true,
    gradient_angle: 90,
    shadow_intensity: 6,
    border_radius: 14,
    blur_effect: 0,
    animation_type: 'bounce',
    animation_duration: 1.8,
    animation_delay: 0,
    use_particles: true,
    particle_type: 'stars',
    use_hover_effects: true,
    card_style: 'elevated',
  },
  {
    name: 'Minimalist Default',
    season: 'default',
    primary_color: '#333333',
    secondary_color: '#ffffff',
    accent_color: '#0066cc',
    background_color: '#f5f5f5',
    text_color: '#333333',
    gradient_enabled: false,
    gradient_angle: 45,
    shadow_intensity: 0,
    border_radius: 4,
    blur_effect: 0,
    animation_type: 'none',
    animation_duration: 1,
    animation_delay: 0,
    use_particles: false,
    particle_type: 'none',
    use_hover_effects: true,
    card_style: 'flat',
  },
  {
    name: 'Vibrant Modern',
    season: 'default',
    primary_color: '#6c5ce7',
    secondary_color: '#a29bfe',
    accent_color: '#00b894',
    background_color: '#f8f9fa',
    text_color: '#2d3436',
    gradient_enabled: true,
    gradient_angle: 45,
    shadow_intensity: 5,
    border_radius: 12,
    blur_effect: 2,
    animation_type: 'pulse',
    animation_duration: 2,
    animation_delay: 0,
    use_particles: false,
    particle_type: 'none',
    use_hover_effects: true,
    card_style: 'elevated',
  },
  {
    name: 'Luxury Dark',
    season: 'default',
    primary_color: '#1a1a1a',
    secondary_color: '#d4af37',
    accent_color: '#b8860b',
    background_color: '#0d0d0d',
    text_color: '#e8e8e8',
    gradient_enabled: true,
    gradient_angle: 135,
    shadow_intensity: 8,
    border_radius: 8,
    blur_effect: 1,
    animation_type: 'fade',
    animation_duration: 1.2,
    animation_delay: 0,
    use_particles: false,
    particle_type: 'none',
    use_hover_effects: true,
    card_style: 'outlined',
  },
]

export default function ThemesManager() {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [activeMode, setActiveMode] = useState('auto') // 'auto' or 'manual'
  const [showInfo, setShowInfo] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [applyingTheme, setApplyingTheme] = useState(false)
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
  }, [])

  const loadThemes = async () => {
    try {
      setLoading(true)
      const response = await apiService.getThemes()
      setThemes(response.data)
      // Check if any theme is manually active
      const hasActiveTheme = response.data.some(t => t.is_active)
      setActiveMode(hasActiveTheme ? 'manual' : 'auto')
    } catch (error) {
      console.error('Failed to load themes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({
      season: '',
      name: '',
      primary_color: '#000000',
      secondary_color: '#ffffff',
      accent_color: '#0066cc',
      background_color: '#f5f5f5',
      text_color: '#333333',
      gradient_enabled: false,
      gradient_angle: 45,
      shadow_intensity: 0,
      border_radius: 0,
      blur_effect: 0,
      animation_type: 'none',
      animation_duration: 1,
      animation_delay: 0,
      use_particles: false,
      particle_type: 'none',
      use_hover_effects: true,
      card_style: 'flat',
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
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this theme?')) return
    try {
      await apiService.deleteTheme(id)
      setThemes(themes.filter(t => t.id !== id))
      alert('Theme deleted successfully')
    } catch (error) {
      alert('Failed to delete theme')
    }
  }

  const handleActivate = async (id) => {
    try {
      await apiService.activateTheme(id)
      setActiveMode('manual')
      loadThemes()
      alert('Theme activated successfully')
    } catch (error) {
      alert('Failed to activate theme')
    }
  }

  const handleApplyPresetDirect = async (activate = false) => {
    if (!selectedPreset) return
    setApplyingTheme(true)
    try {
      // Prepare data - only send valid fields with proper types
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
        animation_duration: parseInt(selectedPreset.animation_duration) || 1,
        animation_delay: parseInt(selectedPreset.animation_delay) || 0,
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
        alert(`Theme "${selectedPreset.name}" created and activated successfully!`)
      } else {
        alert(`Theme "${selectedPreset.name}" created successfully!`)
      }
      
      setSelectedPreset(null)
      loadThemes()
    } catch (error) {
      console.error('Theme creation error:', error.response?.data)
      alert('Failed to apply theme: ' + (error.response?.data?.detail || error.message))
    } finally {
      setApplyingTheme(false)
    }
  }

  const handleSetAuto = async () => {
    if (!window.confirm('Switch to automatic seasonal theme selection?')) return
    try {
      await apiService.setThemeAuto()
      setActiveMode('auto')
      loadThemes()
      alert('Switched to automatic seasonal themes')
    } catch (error) {
      alert('Failed to switch to auto theme')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.season || !formData.name) {
      alert('Please fill in all required fields')
      return
    }
    try {
      if (editingId) {
        await apiService.updateTheme(editingId, formData)
        alert('Theme updated successfully')
      } else {
        await apiService.createTheme(formData)
        alert('Theme created successfully')
      }
      setShowForm(false)
      loadThemes()
    } catch (error) {
      alert('Failed to save theme: ' + (error.response?.data?.detail || error.message))
    }
  }

  const getSeasonLabel = (season) => {
    const option = SEASON_OPTIONS.find(o => o.value === season)
    return option ? option.label : season
  }

  return (
    <div className="manager">
      <div className="manager-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2>Themes</h2>
          <button
            className="btn-icon"
            onClick={() => setShowInfo(!showInfo)}
            title="Learn about seasonal themes"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
          >
            <Info size={20} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className={activeMode === 'auto' ? 'btn-primary' : 'btn-secondary'} 
            onClick={handleSetAuto}
            title="Enable automatic seasonal theme switching"
          >
            {activeMode === 'auto' ? '✓ Auto (Seasonal)' : 'Use Auto (Seasonal)'}
          </button>
          <button className="btn-primary" onClick={handleAdd}>
            <Plus size={20} /> Add Theme
          </button>
        </div>
      </div>

      {showInfo && (
        <div style={{
          background: '#e3f2fd',
          border: '1px solid #90caf9',
          borderRadius: '4px',
          padding: '15px',
          marginBottom: '20px',
          fontSize: '0.9em',
        }}>
          <p><strong>Seasonal Themes:</strong> Automatically switch themes based on the current date and season.</p>
          <ul style={{ marginTop: '10px', marginBottom: '0', paddingLeft: '20px' }}>
            <li><strong>Auto Mode:</strong> Themes change automatically based on date</li>
            <li><strong>Manual Mode:</strong> One theme is manually selected and stays active</li>
            <li>Create themes for different seasons/holidays and the system will use them automatically</li>
            <li>Switch back to auto mode to re-enable seasonal switching</li>
          </ul>
        </div>
      )}

      <div style={{
        marginBottom: '20px',
        padding: '10px',
        background: activeMode === 'auto' ? '#c8e6c9' : '#fff3e0',
        borderRadius: '4px',
        borderLeft: '4px solid ' + (activeMode === 'auto' ? '#4caf50' : '#ff9800'),
      }}>
        <strong>Current Mode:</strong> {activeMode === 'auto' ? 'Automatic Seasonal Switching Enabled' : 'Manual Theme Selected'}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>🎨 Quick Templates</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '10px',
          marginBottom: '20px'
        }}>
          {PRESET_THEMES.map((preset, index) => (
            <button
              key={index}
              onClick={() => setSelectedPreset(preset)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #ddd',
                background: preset.background_color,
                color: preset.text_color,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: 'bold',
                fontSize: '0.9em',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              onMouseEnter={(e) => {
                e.target.style.border = '2px solid ' + preset.primary_color
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.border = '2px solid #ddd'
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
              }}
              title={`Apply ${preset.name} theme`}
            >
              {preset.name}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.85em', color: '#666', marginTop: '10px' }}>
          Click any template to apply it directly or customize it first.
        </p>
      </div>

      {selectedPreset && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '10px' }}>
              Apply "{selectedPreset.name}" Theme?
            </h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Choose how you want to apply this theme:
            </p>
            
            <div style={{
              background: selectedPreset.background_color,
              color: selectedPreset.text_color,
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid ' + selectedPreset.primary_color,
            }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <div className="color-swatch" style={{ background: selectedPreset.primary_color, width: '24px', height: '24px', borderRadius: '4px' }} />
                <div className="color-swatch" style={{ background: selectedPreset.secondary_color, width: '24px', height: '24px', borderRadius: '4px' }} />
                <div className="color-swatch" style={{ background: selectedPreset.accent_color, width: '24px', height: '24px', borderRadius: '4px' }} />
              </div>
              <small>
                <strong>Season:</strong> {getSeasonLabel(selectedPreset.season)} | 
                <strong> Animation:</strong> {ANIMATION_OPTIONS.find(a => a.value === selectedPreset.animation_type)?.label} |
                {selectedPreset.use_particles && <strong> Particles: {PARTICLE_OPTIONS.find(p => p.value === selectedPreset.particle_type)?.label}</strong>}
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setSelectedPreset(null)}
                disabled={applyingTheme}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#f0f0f0',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: applyingTheme ? 'not-allowed' : 'pointer',
                  opacity: applyingTheme ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyPresetDirect(false)}
                disabled={applyingTheme}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: applyingTheme ? 'not-allowed' : 'pointer',
                  opacity: applyingTheme ? 0.5 : 1,
                  fontWeight: 'bold',
                }}
              >
                {applyingTheme ? 'Applying...' : 'Create Theme'}
              </button>
              <button
                onClick={() => handleApplyPresetDirect(true)}
                disabled={applyingTheme}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: applyingTheme ? 'not-allowed' : 'pointer',
                  opacity: applyingTheme ? 0.5 : 1,
                  fontWeight: 'bold',
                }}
              >
                {applyingTheme ? 'Applying...' : 'Create & Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="themes-grid">
        {themes.map((theme) => (
          <div key={theme.id} className="theme-card" style={{
            background: theme.background_color,
            color: theme.text_color,
            border: theme.is_active ? '3px solid ' + theme.accent_color : '1px solid #ddd',
          }}>
            <h3>{theme.name}</h3>
            <p style={{ fontSize: '0.9em', margin: '5px 0' }}>
              <strong>{getSeasonLabel(theme.season)}</strong>
            </p>
            {theme.is_active && (
              <p style={{ fontSize: '0.85em', background: 'rgba(0,0,0,0.1)', padding: '4px', borderRadius: '3px', margin: '5px 0' }}>
                ✓ Currently Active
              </p>
            )}
            <div className="theme-colors" style={{ margin: '10px 0' }}>
              <div className="color-swatch" style={{ background: theme.primary_color }} title="Primary" />
              <div className="color-swatch" style={{ background: theme.secondary_color }} title="Secondary" />
              <div className="color-swatch" style={{ background: theme.accent_color }} title="Accent" />
            </div>
            <div className="theme-actions">
              <button onClick={() => handleEdit(theme)} className="btn-secondary">Edit</button>
              {!theme.is_active ? (
                <button onClick={() => handleActivate(theme.id)} className="btn-primary">Activate</button>
              ) : (
                <button disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} className="btn-primary">Active</button>
              )}
              <button onClick={() => handleDelete(theme.id)} className="btn-danger">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {themes.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No themes created yet. Create your first theme to get started.</p>
        </div>
      )}

      {showForm && (
        <ModalForm
          title={editingId ? 'Edit Theme' : 'Add Seasonal Theme'}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        >
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Basic Settings</h4>
            
            <FormField
              label="Theme Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Winter Frost, Summer Vibes"
              required
            />

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Season <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontFamily: 'inherit',
                }}
              >
                <option value="">-- Select Season --</option>
                {SEASON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <h4>Colors</h4>
            <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.85em' }}>
              <strong>Tip:</strong> Choose colors that match the season's mood
            </div>
          <FormField
            label="Primary Color"
            type="color"
            value={formData.primary_color}
            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
          />
          <FormField
            label="Secondary Color"
            type="color"
            value={formData.secondary_color}
            onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
          />
          <FormField
            label="Accent Color"
            type="color"
            value={formData.accent_color}
            onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
          />
          <FormField
            label="Background Color"
            type="color"
            value={formData.background_color}
            onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
          />
          <FormField
            label="Text Color"
            type="color"
            value={formData.text_color}
            onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
          />

            <h4>Visual Effects</h4>
            
            <FormField
              label="Shadow Intensity"
              type="range"
              min="0"
              max="10"
              value={formData.shadow_intensity || 0}
              onChange={(e) => setFormData({ ...formData, shadow_intensity: parseInt(e.target.value) })}
              title="0 = None, 10 = Strong"
            />

            <FormField
              label="Border Radius"
              type="range"
              min="0"
              max="50"
              value={formData.border_radius || 0}
              onChange={(e) => setFormData({ ...formData, border_radius: parseInt(e.target.value) })}
              title="0 = Sharp, 50 = Fully Round"
            />

            <FormField
              label="Blur Effect"
              type="range"
              min="0"
              max="20"
              value={formData.blur_effect || 0}
              onChange={(e) => setFormData({ ...formData, blur_effect: parseInt(e.target.value) })}
              title="0 = None, 20 = Heavy"
            />

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.gradient_enabled || false}
                  onChange={(e) => setFormData({ ...formData, gradient_enabled: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <strong>Enable Gradient Background</strong>
              </label>
              {formData.gradient_enabled && (
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Gradient Angle: {formData.gradient_angle || 45}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={formData.gradient_angle || 45}
                    onChange={(e) => setFormData({ ...formData, gradient_angle: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>

            <h4>Animations</h4>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Animation Type
              </label>
              <select
                value={formData.animation_type || 'none'}
                onChange={(e) => setFormData({ ...formData, animation_type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontFamily: 'inherit',
                }}
              >
                {ANIMATION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.animation_type !== 'none' && (
              <>
                <FormField
                  label="Animation Duration (seconds)"
                  type="number"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={formData.animation_duration || 1}
                  onChange={(e) => setFormData({ ...formData, animation_duration: parseFloat(e.target.value) })}
                />

                <FormField
                  label="Animation Delay (seconds)"
                  type="number"
                  min="0"
                  max="2"
                  step="0.5"
                  value={formData.animation_delay || 0}
                  onChange={(e) => setFormData({ ...formData, animation_delay: parseFloat(e.target.value) })}
                />
              </>
            )}

            <h4>Decorative Effects</h4>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.use_particles || false}
                  onChange={(e) => setFormData({ ...formData, use_particles: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <strong>Enable Particle Effects</strong>
              </label>
              {formData.use_particles && (
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Particle Type:
                  </label>
                  <select
                    value={formData.particle_type || 'none'}
                    onChange={(e) => setFormData({ ...formData, particle_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontFamily: 'inherit',
                    }}
                  >
                    {PARTICLE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.use_hover_effects !== false}
                  onChange={(e) => setFormData({ ...formData, use_hover_effects: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <strong>Enable Hover Effects on Interactive Elements</strong>
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Card Style
              </label>
              <select
                value={formData.card_style || 'flat'}
                onChange={(e) => setFormData({ ...formData, card_style: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontFamily: 'inherit',
                }}
              >
                {CARD_STYLE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ModalForm>
      )}
    </div>
  )
}
