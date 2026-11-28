import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { apiService, API_BASE_URL } from '../../services/apiService'
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
import ResumeViewer from './components/ResumeViewer'
import './PortfolioViewer.css'
import '../../features/seasonal/styles/seasonal.css'
import '../../features/seasonal/styles/seasonal-decorations.css'

function PortfolioSkeleton() {
  return (
    <div className="pv-skeleton" aria-busy="true" aria-label="Loading portfolio">
      <div className="pv-skel-nav">
        <div className="pv-skel-nav-inner">
          <div className="pv-skel-bar pv-skel-logo" />
          <div className="pv-skel-nav-links">
            <div className="pv-skel-bar pv-skel-link" />
            <div className="pv-skel-bar pv-skel-link" />
            <div className="pv-skel-bar pv-skel-link" />
            <div className="pv-skel-bar pv-skel-link" />
          </div>
        </div>
      </div>
      <div className="pv-skel-hero">
        <div className="pv-skel-copy">
          <div className="pv-skel-bar pv-skel-eyebrow" />
          <div className="pv-skel-bar pv-skel-h1" />
          <div className="pv-skel-bar pv-skel-h1 pv-skel-h1--short" />
          <div className="pv-skel-bar pv-skel-role" />
          <div className="pv-skel-bar pv-skel-line" />
          <div className="pv-skel-bar pv-skel-line pv-skel-line--short" />
          <div className="pv-skel-ctas">
            <div className="pv-skel-bar pv-skel-btn" />
            <div className="pv-skel-bar pv-skel-btn pv-skel-btn--ghost" />
          </div>
        </div>
        <div className="pv-skel-portrait" />
      </div>
    </div>
  )
}

export default function PortfolioViewer() {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showResume, setShowResume] = useState(false)
  const prefetchedRef = useRef(new Set())
  const location = useLocation()
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
    const interval = setInterval(refreshTheme, 3600000)
    // Log visit once per browser session
    if (!sessionStorage.getItem('_pv')) {
      apiService.logVisit({ referrer: document.referrer || '' })
        .then(() => sessionStorage.setItem('_pv', '1'))
        .catch(() => {})
    }
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

  const brandName = portfolio?.about?.hero_name?.trim() || 'Eron Dave Geronimo'

  const resumeFileUrl = useMemo(() => {
    const src = portfolio?.about?.resume_file
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    try {
      const origin = new URL(API_BASE_URL).origin
      return `${origin}${src.startsWith('/') ? '' : '/'}${src}`
    } catch {
      return src
    }
  }, [portfolio?.about?.resume_file])

  const availableSections = useMemo(() => {
    const items = [{ id: 'hero', label: 'Home' }]
    if (portfolio?.projects?.length) items.push({ id: 'projects', label: 'Projects' })
    if (portfolio?.experiences?.length) items.push({ id: 'experience', label: 'Experience' })
    items.push({ id: 'about', label: 'About' })
    if (portfolio?.skills?.length) items.push({ id: 'skills', label: 'Skills' })
    if (portfolio?.certificates?.length) items.push({ id: 'certificates', label: 'Certificates' })
    items.push({ id: 'contact', label: 'Contact' })
    return items
  }, [portfolio])

  useEffect(() => {
    const name = portfolio?.about?.hero_name?.trim() || 'Eron Dave Geronimo'
    const role = portfolio?.about?.hero_role?.trim()
    document.title = role ? `${name} — ${role}` : `${name} — Portfolio`
  }, [portfolio?.about?.hero_name, portfolio?.about?.hero_role])

  useEffect(() => {
    if (loading || !location.hash) return
    const targetId = location.hash.slice(1)
    if (!targetId) return
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(targetId)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(frame)
  }, [loading, location.hash])

  if (loading) {
    return <PortfolioSkeleton />
  }

  return (
    <div className="portfolio-viewer portfolio-root" style={{
      backgroundColor: 'var(--theme-bg)',
      color: 'var(--theme-text)',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Seasonal decorative elements (corners and edges) */}
      <SeasonalDecorations />

      {/* Seasonal background effects - always show seasonal elements with theme colors */}
      <SeasonalBackground showParticles={true} themeColors={colors} />

      <Navigation brandName={brandName} sections={availableSections} />
      <Hero
        about={portfolio?.about}
        socialLinks={portfolio?.social_links}
        hasResume={Boolean(resumeFileUrl)}
        onOpenResume={() => setShowResume(true)}
      />
      <Projects projects={portfolio?.projects} />
      <Experience experiences={portfolio?.experiences} />
      <About
        about={portfolio?.about}
        projectsCount={portfolio?.projects?.length ?? 0}
        experiences={portfolio?.experiences}
        certificatesCount={portfolio?.certificates?.length ?? 0}
      />
      <Skills skills={portfolio?.skills} />
      <Certificates certificates={portfolio?.certificates} />
      <Contact about={portfolio?.about} socialLinks={portfolio?.social_links} />
      <Footer socialLinks={portfolio?.social_links} brandName={brandName} sections={availableSections} />

      {showResume && resumeFileUrl && (
        <ResumeViewer
          url={resumeFileUrl}
          onClose={() => setShowResume(false)}
          colors={colors}
        />
      )}
    </div>
  )
}
