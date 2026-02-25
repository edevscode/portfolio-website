import React from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import './Footer.css'

export default function Footer({ socialLinks }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()
  const currentYear = new Date().getFullYear()

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

  return (
    <footer className="footer" style={{
      backgroundColor: colors.primary,
      color: colors.background
    }}>
      <div className="footer-content">
        <div className="footer-section">
          <h4 style={{ color: colors.secondary }}>Connect</h4>
          <div className="social-links">
            {socialLinks && socialLinks.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform} style={{
                color: colors.background,
                borderColor: colors.accent
              }}>
                {link.platform}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-section">
          <h4 style={{ color: colors.secondary }}>Quick Links</h4>
          <ul>
            <li><a href="#hero" style={{ color: colors.background }}>Home</a></li>
            <li><a href="#about" style={{ color: colors.background }}>About</a></li>
            <li><a href="#skills" style={{ color: colors.background }}>Skills</a></li>
            <li><a href="#projects" style={{ color: colors.background }}>Projects</a></li>
            <li><a href="#experience" style={{ color: colors.background }}>Experience</a></li>
            <li><a href="#contact" style={{ color: colors.background }}>Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Portfolio. All rights reserved.</p>
      </div>
    </footer>
  )
}
