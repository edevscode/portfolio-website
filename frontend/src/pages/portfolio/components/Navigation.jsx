import React from 'react'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import './Navigation.css'

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
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

  return (
    <nav className="portfolio-nav" style={{
      backgroundColor: colors.primary,
      borderBottomColor: colors.accent
    }}>
      <div className="nav-container">
        <a href="#hero" className="nav-logo" onClick={handleNavClick} style={{
          color: colors.background
        }}>
          Portfolio
        </a>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} style={{
          color: colors.background
        }}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li><a href="#hero" className="nav-link" onClick={handleNavClick} style={{
            color: colors.background
          }}>Home</a></li>
          <li><a href="#about" className="nav-link" onClick={handleNavClick} style={{
            color: colors.background
          }}>About</a></li>
          <li><a href="#skills" className="nav-link" onClick={handleNavClick} style={{
            color: colors.background
          }}>Skills</a></li>
          <li><a href="#projects" className="nav-link" onClick={handleNavClick} style={{
            color: colors.background
          }}>Projects</a></li>
          <li><a href="#experience" className="nav-link" onClick={handleNavClick} style={{
            color: colors.background
          }}>Experience</a></li>
          <li><a href="#contact" className="nav-link" onClick={handleNavClick} style={{
            color: colors.background
          }}>Contact</a></li>
        </ul>
      </div>
    </nav>
  )
}
