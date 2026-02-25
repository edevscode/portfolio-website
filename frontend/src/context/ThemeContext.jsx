import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiService } from '../services/apiService'

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
    
    // Apply colors
    root.style.setProperty('--primary-color', themeData.primary_color)
    root.style.setProperty('--secondary-color', themeData.secondary_color)
    root.style.setProperty('--accent-color', themeData.accent_color)
    root.style.setProperty('--bg-color', themeData.background_color)
    root.style.setProperty('--text-color', themeData.text_color)
    
    // Apply visual effects
    if (themeData.background_image) {
      root.style.setProperty('--bg-image', `url(${themeData.background_image})`)
    } else {
      root.style.setProperty('--bg-image', 'none')
    }
    
    // Gradient effect
    if (themeData.gradient_enabled) {
      const gradient = `linear-gradient(${themeData.gradient_angle}deg, ${themeData.primary_color}, ${themeData.secondary_color})`
      root.style.setProperty('--bg-gradient', gradient)
    } else {
      root.style.setProperty('--bg-gradient', 'none')
    }
    
    // Shadow intensity (0-10 scale)
    const shadowIntensity = (themeData.shadow_intensity || 0) / 10
    const shadowColor = `rgba(0, 0, 0, ${shadowIntensity * 0.3})`
    root.style.setProperty('--shadow-color', shadowColor)
    root.style.setProperty('--shadow-blur', `${shadowIntensity * 20}px`)
    
    // Border radius effect
    root.style.setProperty('--border-radius', `${themeData.border_radius || 0}px`)
    
    // Blur effect
    root.style.setProperty('--blur-effect', `blur(${themeData.blur_effect || 0}px)`)
    
    // Animation properties
    root.style.setProperty('--animation-type', themeData.animation_type || 'none')
    root.style.setProperty('--animation-duration', `${themeData.animation_duration || 1}s`)
    root.style.setProperty('--animation-delay', `${themeData.animation_delay || 0}s`)
    
    // Hover effects
    root.style.setProperty('--use-hover-effects', themeData.use_hover_effects ? '1' : '0')
    
    // Card style
    root.style.setProperty('--card-style', themeData.card_style || 'flat')
    
    // Particles
    root.style.setProperty('--particle-type', themeData.particle_type || 'none')
    root.style.setProperty('--use-particles', themeData.use_particles ? '1' : '0')
    
    // Apply theme-specific animations/styles
    applyThemeAnimations(themeData)
    applyParticleEffects(themeData)
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
    const hoverStyles = themeData.use_hover_effects ? getHoverStyles(themeData) : ''
    const cardStyles = getCardStyles(themeData.card_style, themeData)
    
    styleTag.textContent = `
      ${animationKeyframes}
      
      :root[data-theme-animation="${themeData.animation_type}"] {
        --animation-active: 1;
      }
      
      .theme-animated-element {
        animation: themeAnimation var(--animation-duration) ease-in-out var(--animation-delay) forwards;
      }
      
      ${hoverStyles}
      ${cardStyles}
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

  const getHoverStyles = (themeData) => {
    return `
      button, a, .interactive-element {
        transition: all 0.3s ease;
      }
      
      button:hover, a:hover, .interactive-element:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px ${themeData.primary_color}40;
      }
      
      button:active {
        transform: translateY(0px);
      }
    `
  }

  const getCardStyles = (cardStyle, themeData) => {
    const styles = {
      flat: `
        .card, .theme-card {
          background: var(--bg-color);
          border: none;
          border-radius: var(--border-radius);
        }
      `,
      elevated: `
        .card, .theme-card {
          background: var(--bg-color);
          border-radius: var(--border-radius);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1);
        }
        
        .card:hover, .theme-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.2), 0 16px 40px rgba(0,0,0,0.15);
          transform: translateY(-4px);
        }
      `,
      outlined: `
        .card, .theme-card {
          background: var(--bg-color);
          border: 2px solid var(--primary-color);
          border-radius: var(--border-radius);
        }
      `,
    }
    return styles[cardStyle] || styles.flat
  }

  const applyParticleEffects = (themeData) => {
    if (!themeData.use_particles) {
      removeParticles()
      return
    }

    const particleContainer = document.getElementById('theme-particles')
    if (!particleContainer) {
      const container = document.createElement('div')
      container.id = 'theme-particles'
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
        z-index: 1;
      `
      document.body.insertBefore(container, document.body.firstChild)
    }

    const container = document.getElementById('theme-particles')
    container.innerHTML = '' // Clear existing particles

    const particleType = themeData.particle_type
    const particleColor = themeData.primary_color
    const particleCount = 30

    for (let i = 0; i < particleCount; i++) {
      createParticle(container, particleType, particleColor, i)
    }
  }

  const createParticle = (container, type, color, index) => {
    const particle = document.createElement('div')
    particle.style.cssText = `
      position: absolute;
      pointer-events: none;
    `

    const size = Math.random() * 4 + 2
    const left = Math.random() * 100
    const duration = Math.random() * 10 + 10

    particle.innerHTML = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        opacity: 0.6;
        animation: particle-${type}-${index} ${duration}s linear infinite;
      "></div>
    `

    // Add animation styles
    const animationStyle = document.createElement('style')
    if (type === 'snow') {
      animationStyle.textContent = `
        @keyframes particle-${type}-${index} {
          0% { top: -10px; left: ${left}%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100vh; left: calc(${left}% + ${(Math.random() - 0.5) * 50}px); opacity: 0; }
        }
      `
    } else if (type === 'leaves') {
      animationStyle.textContent = `
        @keyframes particle-${type}-${index} {
          0% { top: -10px; left: ${left}%; transform: rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100vh; left: calc(${left}% + ${(Math.random() - 0.5) * 100}px); transform: rotate(360deg); opacity: 0; }
        }
      `
    } else if (type === 'stars') {
      animationStyle.textContent = `
        @keyframes particle-${type}-${index} {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `
    }

    if (animationStyle.textContent) {
      document.head.appendChild(animationStyle)
    }
    container.appendChild(particle)
  }

  const removeParticles = () => {
    const container = document.getElementById('theme-particles')
    if (container) {
      container.remove()
    }
  }

  const value = {
    theme,
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
