import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import './Navigation.css'

const DEFAULT_SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'contact', label: 'Contact' },
]

export default function Navigation({ brandName = 'Portfolio', sections = DEFAULT_SECTIONS }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState('hero')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile drawer on Escape and lock body scroll while open
  useEffect(() => {
    if (!menuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [menuOpen])

  // Track active section in viewport for aria-current indicator
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.25, 0.5] }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  const handleNavClick = (id) => {
    if (id) setActiveId(id)
    setMenuOpen(false)
  }

  return (
    <nav className={`portfolio-nav${scrolled ? ' nav-scrolled' : ''}`} aria-label="Primary">
      <div className="nav-container">
        <a href="#hero" className="nav-logo" onClick={() => handleNavClick('hero')}>
          {brandName || 'Portfolio'}
        </a>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="portfolio-nav-menu"
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>

        <ul id="portfolio-nav-menu" className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`nav-link${activeId === section.id ? ' nav-link--active' : ''}`}
                aria-current={activeId === section.id ? 'location' : undefined}
                onClick={() => handleNavClick(section.id)}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
