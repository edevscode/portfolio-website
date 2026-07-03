import React, { useState, useEffect, useRef } from 'react'
import { apiService } from '../../services/apiService'
import { cache, CACHE_KEYS, CACHE_TTL } from '../../services/cache'
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
import Certificates from './components/Certificates'
import Contact from './components/Contact'
import Footer from './components/Footer'
import './PortfolioViewer.css'
import '../../features/seasonal/styles/seasonal.css'
import '../../features/seasonal/styles/seasonal-decorations.css'

export default function PortfolioViewer() {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const prefetchedRef = useRef(new Set())
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
    const cached = cache.get(CACHE_KEYS.portfolio)
    if (cached) {
      // Serve from cache instantly, revalidate in background
      setPortfolio(cached)
      setLoading(false)
      apiService.getPortfolio()
        .then(res => {
          cache.set(CACHE_KEYS.portfolio, res.data, CACHE_TTL.portfolio)
          setPortfolio(res.data)
        })
        .catch(() => {})
      return
    }

    try {
      const response = await apiService.getPortfolio()
      cache.set(CACHE_KEYS.portfolio, response.data, CACHE_TTL.portfolio)
      setPortfolio(response.data)
    } catch (error) {
      console.error('Failed to load portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  // After portfolio loads, prefetch every project detail during browser idle time
  useEffect(() => {
    const projects = portfolio?.projects
    if (!projects?.length) return

    const toPrefetch = projects.filter(p => {
      const slug = String(p.slug || p.id)
      return slug && !cache.has(CACHE_KEYS.project(slug)) && !prefetchedRef.current.has(slug)
    })
    if (!toPrefetch.length) return

    let handle
    const useIdle = typeof requestIdleCallback === 'function'

    const prefetchAll = () => {
      for (const project of toPrefetch) {
        const slug = String(project.slug || project.id)
        prefetchedRef.current.add(slug)
        apiService.getProject(slug)
          .then(res => cache.set(CACHE_KEYS.project(slug), res.data, CACHE_TTL.project))
          .catch(() => prefetchedRef.current.delete(slug))
      }
    }

    if (useIdle) {
      handle = requestIdleCallback(prefetchAll, { timeout: 3000 })
    } else {
      handle = setTimeout(prefetchAll, 1500)
    }

    return () => {
      if (useIdle) cancelIdleCallback(handle)
      else clearTimeout(handle)
    }
  }, [portfolio])

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
      <Certificates certificates={portfolio?.certificates} />
      <Contact about={portfolio?.about} socialLinks={portfolio?.social_links} />
      <Footer socialLinks={portfolio?.social_links} />
    </div>
  )
}
