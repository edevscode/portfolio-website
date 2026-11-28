import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { safeHref } from '../../../utils/sanitize'
import './Footer.css'

const DEFAULT_SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'contact', label: 'Contact' },
]

export default function Footer({ socialLinks, brandName = 'Portfolio', sections = DEFAULT_SECTIONS }) {
  const location = useLocation()
  const currentYear = new Date().getFullYear()
  const isHome = location.pathname === '/'
  const validSocialLinks = (socialLinks || []).filter((link) => safeHref(link.url))

  return (
    <footer className="footer">
      <div className="footer-content">
        {validSocialLinks.length > 0 && (
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              {validSocialLinks.map((link) => (
                <a
                  key={link.id}
                  href={safeHref(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.platform}
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                {isHome ? (
                  <a href={`#${section.id}`}>{section.label}</a>
                ) : (
                  <Link to={`/#${section.id}`}>{section.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} {brandName || 'Portfolio'}. All rights reserved.</p>
      </div>
    </footer>
  )
}
