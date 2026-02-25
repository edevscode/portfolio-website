import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import { useTheme } from '../../context/ThemeContext'
import { useSeasonContext } from '../../context/useSeasonContext'
import { SeasonalBackground } from '../../features/seasonal/components/SeasonalEffects'
import { SeasonalDecorations } from '../../features/seasonal/components/SeasonalDecorations'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Footer from './components/Footer'
import './PortfolioViewer.css'
import '../../features/seasonal/styles/seasonal.css'
import '../../features/seasonal/styles/seasonal-decorations.css'

export default function PortfolioViewer() {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const { theme, refreshTheme } = useTheme()
  const { config: seasonConfig, setSeason } = useSeasonContext()

  // Determine if an admin theme is active (has season property matching a theme name, not auto-detected)
  const isAdminThemeActive = theme && theme.is_active === true

  // Update the season context to match the active theme's season if one is set
  useEffect(() => {
    if (isAdminThemeActive && theme?.season) {
      setSeason(theme.season)
    }
  }, [isAdminThemeActive, theme?.season, setSeason])

  const colors = theme ? {
    primary: theme.primary_color || seasonConfig?.colors?.primary || '#1a472a',
    background: theme.background_color || seasonConfig?.colors?.background || 'white',
    text: theme.text_color || seasonConfig?.colors?.text || 'black',
    secondary: theme.secondary_color || seasonConfig?.colors?.secondary || '#e8f4f8',
    accent: theme.accent_color || seasonConfig?.colors?.accent || '#4da6ff'
  } : {
    primary: seasonConfig?.colors?.primary || '#1a472a',
    background: seasonConfig?.colors?.background || 'white',
    text: seasonConfig?.colors?.text || 'black',
    secondary: seasonConfig?.colors?.secondary || '#e8f4f8',
    accent: seasonConfig?.colors?.accent || '#4da6ff'
  }

  useEffect(() => {
    loadPortfolio()
    // Refresh theme periodically to check for seasonal changes
    const interval = setInterval(refreshTheme, 3600000) // Every hour
    return () => clearInterval(interval)
  }, [])

  const loadPortfolio = async () => {
    try {
      const response = await apiService.getPortfolio()
      setPortfolio(response.data)
    } catch (error) {
      console.error('Failed to load portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  return (
    <div className="portfolio-viewer" style={{
      backgroundColor: colors.background,
      color: colors.text,
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Seasonal decorative elements (corners and edges) */}
      <SeasonalDecorations />

      {/* Seasonal background effects - always show seasonal elements with theme colors */}
      <SeasonalBackground showParticles={true} themeColors={colors} />

      <Navigation />
      <Hero about={portfolio?.about} />
      <About about={portfolio?.about} />
      <Skills skills={portfolio?.skills} />
      <Projects projects={portfolio?.projects} />
      <Experience experiences={portfolio?.experiences} />
      <Contact about={portfolio?.about} socialLinks={portfolio?.social_links} />
      <Footer socialLinks={portfolio?.social_links} />
    </div>
  )
}
