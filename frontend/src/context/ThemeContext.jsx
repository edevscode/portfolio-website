import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiService } from '../services/apiService'
import { safeHexColor, safeHref } from '../utils/sanitize'
import { resolveThemeTokens } from '../utils/color'

const ALLOWED_ANIMATIONS = new Set(['none', 'fade', 'slide', 'bounce', 'glow', 'float', 'pulse', 'gradient'])
const ALLOWED_PARTICLES = new Set(['none', 'snow', 'leaves', 'stars'])
const ALLOWED_CARD_STYLES = new Set(['flat', 'elevated', 'outlined'])

const ThemeContext = createContext()

export function useTheme() {
  return useContext(ThemeContext)
}

// Helper function to get current season
function getCurrentSeason() {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()

  if (month === 1 && day <= 7) return 'new_year'
  if (month === 2 && day >= 10 && day <= 18) return 'valentine'
  if (month === 3 && day >= 20) return 'spring'
  if (month === 4 || (month === 5 && day < 20)) return 'easter'
  if ((month === 5 && day >= 20) || month === 6 || month === 7 || month === 8) return 'summer'
  if (month === 9 || (month === 10 && day < 25)) return 'autumn'
  if (month === 10 && day >= 25) return 'halloween'
  if (month === 11) return day >= 20 ? 'thanksgiving' : 'autumn'
  if (month === 12) return day >= 20 ? 'christmas' : 'autumn'
  
  return 'spring'
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentSeason, setCurrentSeason] = useState(getCurrentSeason())
  const [isAutoTheme, setIsAutoTheme] = useState(true)

  useEffect(() => {
    fetchTheme()
    
    // Check every minute if season has changed (for demos/testing)
    const interval = setInterval(() => {
      const newSeason = getCurrentSeason()
      if (newSeason !== currentSeason) {
        setCurrentSeason(newSeason)
        fetchTheme() // Refresh theme if season changed
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const fetchTheme = async () => {
    try {
      const response = await apiService.getCurrentTheme()
      const themeData = response.data
      
      // Mark whether this is an explicitly set active theme
      themeData.is_active = themeData.is_active === true
      
      setTheme(themeData)
      applyTheme(themeData)
    } catch (error) {
      console.error('Failed to fetch theme:', error)
      const defaultTheme = getDefaultTheme()
      defaultTheme.is_active = false
      setTheme(defaultTheme)
      applyTheme(defaultTheme)
    } finally {
      setLoading(false)
    }
  }

  const getDefaultTheme = () => ({
    primary_color: '#000000',
    secondary_color: '#ffffff',
    accent_color: '#0066cc',
    background_color: '#f5f5f5',
    text_color: '#333333',
    background_image: null,
    season: 'default',
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

  const applyTheme = (themeData) => {
    const root = document.documentElement
    const primaryColor = safeHexColor(themeData.primary_color, '#000000')
    const secondaryColor = safeHexColor(themeData.secondary_color, '#ffffff')
    const accentColor = safeHexColor(themeData.accent_color, '#0066cc')
    const bgColor = safeHexColor(themeData.background_color, '#f5f5f5')
    const textColor = safeHexColor(themeData.text_color, '#333333')
    const safeAnimType = ALLOWED_ANIMATIONS.has(themeData.animation_type) ? themeData.animation_type : 'none'
    const safeParticleType = ALLOWED_PARTICLES.has(themeData.particle_type) ? themeData.particle_type : 'none'
    const safeCardStyle = ALLOWED_CARD_STYLES.has(themeData.card_style) ? themeData.card_style : 'flat'
    const safeTheme = {
      ...themeData,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
      background_color: bgColor,
      text_color: textColor,
      animation_type: safeAnimType,
      particle_type: safeParticleType,
      card_style: safeCardStyle,
    }
    
    // Apply raw colors (preserved for backwards compatibility)
    root.style.setProperty('--primary-color', primaryColor)
    root.style.setProperty('--secondary-color', secondaryColor)
    root.style.setProperty('--accent-color', accentColor)
    root.style.setProperty('--bg-color', bgColor)
    root.style.setProperty('--text-color', textColor)

    // Apply WCAG-verified semantic tokens for Portfolio Viewer
    const tokens = resolveThemeTokens(safeTheme)
    root.style.setProperty('--theme-bg', tokens.bg)
    root.style.setProperty('--theme-text', tokens.text)
    root.style.setProperty('--theme-text-muted', tokens.textMuted)
    root.style.setProperty('--theme-surface', tokens.surface)
    root.style.setProperty('--theme-surface-text', tokens.surfaceText)
    root.style.setProperty('--theme-surface-muted', tokens.surfaceMuted)
    root.style.setProperty('--theme-heading', tokens.heading)
    root.style.setProperty('--theme-heading-on-surface', tokens.headingOnSurface)
    root.style.setProperty('--theme-accent-text', tokens.accentText)
    root.style.setProperty('--theme-accent-on-surface', tokens.accentOnSurface)
    root.style.setProperty('--theme-on-primary', tokens.onPrimary)
    root.style.setProperty('--theme-on-accent', tokens.onAccent)
    root.style.setProperty('--theme-on-primary-muted', tokens.onPrimaryMuted)
    root.style.setProperty('--theme-on-primary-border', tokens.onPrimaryBorder)
    root.style.setProperty('--theme-border', tokens.border)
    root.style.setProperty('--theme-border-strong', tokens.borderStrong)
    root.style.setProperty('--theme-surface-border', tokens.surfaceBorder)
    root.style.setProperty('--theme-tint', tokens.tint)
    root.style.setProperty('--theme-surface-tint', tokens.surfaceTint)
    
    // Apply visual effects
    const safeBgImage = safeHref(themeData.background_image)
    if (safeBgImage && /^https?:/i.test(safeBgImage)) {
      root.style.setProperty('--bg-image', `url("${encodeURI(safeBgImage)}")`)
    } else {
      root.style.setProperty('--bg-image', 'none')
    }
    
    // Gradient effect
    if (themeData.gradient_enabled) {
      const angle = Number.isFinite(Number(themeData.gradient_angle)) ? Number(themeData.gradient_angle) : 45
      const gradient = `linear-gradient(${angle}deg, ${primaryColor}, ${secondaryColor})`
      root.style.setProperty('--bg-gradient', gradient)
    } else {
      root.style.setProperty('--bg-gradient', 'none')
    }
    
    // Shadow intensity (0-10 scale)
    const shadowIntensity = (Number(themeData.shadow_intensity) || 0) / 10
    const shadowColor = `rgba(0, 0, 0, ${shadowIntensity * 0.3})`
    root.style.setProperty('--shadow-color', shadowColor)
    root.style.setProperty('--shadow-blur', `${shadowIntensity * 20}px`)
    
    // Border radius effect (isolated from base input --border-radius)
    root.style.setProperty('--theme-border-radius', `${Number(themeData.border_radius) || 0}px`)
    
    // Blur effect
    root.style.setProperty('--blur-effect', `blur(${Number(themeData.blur_effect) || 0}px)`)
    
    // Animation properties
    root.style.setProperty('--animation-type', safeAnimType)
    root.style.setProperty('--animation-duration', `${Number(themeData.animation_duration) || 1}s`)
    root.style.setProperty('--animation-delay', `${Number(themeData.animation_delay) || 0}s`)
    
    // Hover effects
    root.style.setProperty('--use-hover-effects', themeData.use_hover_effects ? '1' : '0')
    
    // Card style
    root.style.setProperty('--card-style', safeCardStyle)
    
    // Particles
    root.style.setProperty('--particle-type', safeParticleType)
    root.style.setProperty('--use-particles', themeData.use_particles ? '1' : '0')
    
    // Apply theme-specific animations/styles
    applyThemeAnimations(safeTheme)
    applyParticleEffects(safeTheme)
  }

  const applyThemeAnimations = (themeData) => {
    let styleId = 'theme-animations'
    let styleTag = document.getElementById(styleId)
    
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = styleId
      document.head.appendChild(styleTag)
    }

    const animationKeyframes = getAnimationKeyframes(themeData.animation_type)
    
    // Keep dynamic styles scoped strictly to Viewer opt-in elements so Admin
    // controls, plain text links, and .theme-card tiles remain unaffected.
    styleTag.textContent = `
      ${animationKeyframes}
      
      :root[data-theme-animation="${themeData.animation_type}"] {
        --animation-active: 1;
      }
      
      .portfolio-root .theme-animated-element {
        animation: themeAnimation var(--animation-duration) ease-in-out var(--animation-delay) forwards;
      }
    `
  }

  const getAnimationKeyframes = (animationType) => {
    const keyframes = {
      fade: `@keyframes themeAnimation { 
        from { opacity: 0; } 
        to { opacity: 1; } 
      }`,
      slide: `@keyframes themeAnimation { 
        from { transform: translateX(-20px); opacity: 0; } 
        to { transform: translateX(0); opacity: 1; } 
      }`,
      bounce: `@keyframes themeAnimation { 
        0% { transform: translateY(-10px); } 
        50% { transform: translateY(0); } 
        100% { transform: translateY(-2px); } 
      }`,
      glow: `@keyframes themeAnimation { 
        from { filter: drop-shadow(0 0 0 transparent); } 
        to { filter: drop-shadow(0 0 10px var(--accent-color)); } 
      }`,
      float: `@keyframes themeAnimation { 
        0%, 100% { transform: translateY(0px); } 
        50% { transform: translateY(-10px); } 
      }`,
      pulse: `@keyframes themeAnimation { 
        0% { transform: scale(0.95); opacity: 0.7; } 
        50% { transform: scale(1); opacity: 1; } 
        100% { transform: scale(0.98); opacity: 0.8; } 
      }`,
      gradient: `@keyframes themeAnimation { 
        0% { background-position: 0% 50%; } 
        50% { background-position: 100% 50%; } 
        100% { background-position: 0% 50%; } 
      }`,
      none: `@keyframes themeAnimation { 
        from { opacity: 1; } 
        to { opacity: 1; } 
      }`,
    }
    return keyframes[animationType] || keyframes.none
  }

  const applyParticleEffects = (themeData) => {
    if (!themeData.use_particles || !ALLOWED_PARTICLES.has(themeData.particle_type) || themeData.particle_type === 'none') {
      removeParticles()
      return
    }

    let container = document.getElementById('theme-particles')
    if (!container) {
      container = document.createElement('div')
      container.id = 'theme-particles'
      container.style.position = 'fixed'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '100%'
      container.style.height = '100%'
      container.style.pointerEvents = 'none'
      container.style.overflow = 'hidden'
      container.style.zIndex = '1'
      document.body.insertBefore(container, document.body.firstChild)
    }

    container.replaceChildren()

    const particleType = themeData.particle_type
    const particleColor = safeHexColor(themeData.primary_color, '#000000')
    const particleCount = 30
    const cssRules = []

    for (let i = 0; i < particleCount; i++) {
      const rule = createParticle(container, particleType, particleColor, i)
      if (rule) cssRules.push(rule)
    }

    let styleTag = document.getElementById('theme-particle-styles')
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = 'theme-particle-styles'
      document.head.appendChild(styleTag)
    }
    styleTag.textContent = cssRules.join('\n')
  }

  const createParticle = (container, type, color, index) => {
    const particle = document.createElement('div')
    particle.style.position = 'absolute'
    particle.style.pointerEvents = 'none'

    const size = Math.random() * 4 + 2
    const left = Math.random() * 100
    const duration = Math.random() * 10 + 10

    const dot = document.createElement('div')
    dot.style.width = `${size}px`
    dot.style.height = `${size}px`
    dot.style.background = color
    dot.style.borderRadius = '50%'
    dot.style.opacity = '0.6'
    dot.style.animation = `particle-${type}-${index} ${duration}s linear infinite`
    particle.appendChild(dot)
    container.appendChild(particle)

    if (type === 'snow') {
      return `@keyframes particle-${type}-${index} {
        0% { top: -10px; left: ${left}%; opacity: 0; }
        10% { opacity: 0.8; }
        90% { opacity: 0.8; }
        100% { top: 100vh; left: calc(${left}% + ${(Math.random() - 0.5) * 50}px); opacity: 0; }
      }`
    }
    if (type === 'leaves') {
      return `@keyframes particle-${type}-${index} {
        0% { top: -10px; left: ${left}%; transform: rotate(0deg); opacity: 0; }
        10% { opacity: 0.8; }
        90% { opacity: 0.8; }
        100% { top: 100vh; left: calc(${left}% + ${(Math.random() - 0.5) * 100}px); transform: rotate(360deg); opacity: 0; }
      }`
    }
    if (type === 'stars') {
      return `@keyframes particle-${type}-${index} {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }`
    }
    return ''
  }

  const removeParticles = () => {
    const container = document.getElementById('theme-particles')
    if (container) container.remove()
    const styleTag = document.getElementById('theme-particle-styles')
    if (styleTag) styleTag.remove()
  }

  const resolvedColors = useMemo(
    () => resolveThemeTokens(theme || getDefaultTheme()),
    [theme]
  )

  const value = {
    theme,
    resolvedColors,
    loading,
    currentSeason,
    isAutoTheme,
    refreshTheme: fetchTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
