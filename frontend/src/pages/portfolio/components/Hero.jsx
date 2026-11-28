import React from 'react'
import { FileText, MapPin, ArrowUpRight } from 'lucide-react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import { API_BASE_URL } from '../../../services/apiService'
import { safeHref } from '../../../utils/sanitize'
import './Hero.css'

export default function Hero({ about, socialLinks = [], hasResume = false, onOpenResume }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()

  const profileImageUrl = (() => {
    const src = about?.profile_image
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    const origin = new URL(API_BASE_URL).origin
    return `${origin}${src.startsWith('/') ? '' : '/'}${src}`
  })()

  const colors = theme ? {
    primary:    theme.primary_color    || seasonConfig?.colors?.primary    || '#1a472a',
    accent:     theme.accent_color     || seasonConfig?.colors?.accent     || '#6366f1',
    background: theme.background_color || seasonConfig?.colors?.background || '#ffffff',
    secondary:  theme.secondary_color  || seasonConfig?.colors?.secondary  || '#f1f5f9',
    text:       theme.text_color       || seasonConfig?.colors?.text       || '#1e293b',
  } : {
    primary:    seasonConfig?.colors?.primary    || '#1a472a',
    accent:     seasonConfig?.colors?.accent     || '#6366f1',
    background: seasonConfig?.colors?.background || '#ffffff',
    secondary:  seasonConfig?.colors?.secondary  || '#f1f5f9',
    text:       seasonConfig?.colors?.text       || '#1e293b',
  }

  const primaryCta = {
    text: about?.hero_cta_primary_text   || 'View My Work',
    href: safeHref(about?.hero_cta_primary_link, '#projects'),
  }
  const secondaryCta = {
    text: about?.hero_cta_secondary_text || 'Get In Touch',
    href: safeHref(about?.hero_cta_secondary_link, '#contact'),
  }
  const isExternal = (href) => /^https?:/i.test(href || '')
  const ctaAlreadyMentionsResume = [primaryCta.text, secondaryCta.text]
    .some((t) => /\b(resume|cv)\b/i.test(t || ''))

  const quickLinks = (Array.isArray(socialLinks) ? socialLinks : [])
    .filter((link) => link.is_visible !== false && safeHref(link.url))
    .slice(0, 5)

  return (
    <section
      className="hero-section"
      id="hero"
      style={{
        '--hp': colors.primary,
        '--ha': colors.accent,
        '--hb': colors.background,
        '--ht': colors.text,
        '--hs': colors.secondary,
      }}
    >
      <div className="hero-inner">

        {/* ── Left: text ── */}
        <div className="hero-text">
          <div className="hero-meta-top">
            <span className="hero-greeting">Hello, I&apos;m</span>
            {about?.location && (
              <span className="hero-location">
                <MapPin size={12} aria-hidden="true" />
                {about.location}
              </span>
            )}
          </div>

          <h1 className="hero-name">
            {about?.hero_name || about?.hero_heading || 'Your Name'}
          </h1>

          {(about?.hero_role || about?.hero_subheading) && (
            <p className="hero-role">
              {about.hero_role || about.hero_subheading}
            </p>
          )}

          {about?.hero_tagline && (
            <p className="hero-tagline">{about.hero_tagline}</p>
          )}

          <div className="hero-ctas">
            <a
              href={primaryCta.href}
              className="hero-btn-primary"
              {...(isExternal(primaryCta.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {primaryCta.text}
            </a>
            <a
              href={secondaryCta.href}
              className="hero-btn-secondary"
              {...(isExternal(secondaryCta.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {secondaryCta.text}
            </a>
            {hasResume && onOpenResume && !ctaAlreadyMentionsResume && (
              <button
                type="button"
                className="hero-btn-resume"
                onClick={onOpenResume}
              >
                <FileText size={15} aria-hidden="true" />
                Resume
              </button>
            )}
          </div>

          {quickLinks.length > 0 && (
            <div className="hero-social-row" aria-label="Quick profile links">
              {quickLinks.map((link) => (
                <a
                  key={link.id}
                  href={safeHref(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-link"
                >
                  <span>{link.platform}</span>
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: photo ── */}
        <div className="hero-visual">
          <div className="hero-photo-wrap">
            <div className="hero-photo-backdrop" aria-hidden="true" />
            <div className="hero-photo-frame">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={about?.hero_name || 'Profile'}
                  className="hero-photo"
                />
              ) : (
                <div className="hero-photo hero-photo--empty" />
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Scroll indicator */}
      <a href="#projects" className="hero-scroll" aria-label="Scroll to projects">
        <span className="hero-scroll-track">
          <span className="hero-scroll-thumb" />
        </span>
      </a>
    </section>
  )
}
