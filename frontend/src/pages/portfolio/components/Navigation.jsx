import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import { getReadableTextColor } from '../../../utils/color'
import './Navigation.css'

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()

  const colors = theme ? {
    primary: theme.primary_color || seasonConfig?.colors?.primary || '#1a472a',
    background: theme.background_color || seasonConfig?.colors?.background || 'white',
    accent: theme.accent_color || seasonConfig?.colors?.accent || '#4da6ff'
  } : {
    primary: seasonConfig?.colors?.primary || '#1a472a',
    background: seasonConfig?.colors?.background || 'white',
    accent: seasonConfig?.colors?.accent || '#4da6ff'
  }

  const handleNavClick = () => {
    setMenuOpen(false)
  }

  const navText = getReadableTextColor(colors.primary)

  return (
    <nav className={`portfolio-nav${scrolled ? ' nav-scrolled' : ''}`} style={{
      backgroundColor: colors.primary,
      borderBottomColor: colors.accent
    }}>
      <div className="nav-container">
        <a href="#hero" className="nav-logo" onClick={handleNavClick} style={{
          color: navText
        }}>
          Portfolio
        </a>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} style={{
          color: navText
        }}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`} style={{ backgroundColor: colors.primary }}>
          <li><a href="#hero" className="nav-link" onClick={handleNavClick} style={{
            color: navText
          }}>Home</a></li>
          <li><a href="#about" className="nav-link" onClick={handleNavClick} style={{
            color: navText
          }}>About</a></li>
          <li><a href="#skills" className="nav-link" onClick={handleNavClick} style={{
            color: navText
          }}>Skills</a></li>
          <li><a href="#projects" className="nav-link" onClick={handleNavClick} style={{
            color: navText
          }}>Projects</a></li>
          <li><a href="#experience" className="nav-link" onClick={handleNavClick} style={{
            color: navText
          }}>Experience</a></li>
          <li><a href="#certificates" className="nav-link" onClick={handleNavClick} style={{
            color: navText
          }}>Certificates</a></li>
          <li><a href="#contact" className="nav-link" onClick={handleNavClick} style={{
            color: navText
          }}>Contact</a></li>
        </ul>
      </div>
    </nav>
  )
}
