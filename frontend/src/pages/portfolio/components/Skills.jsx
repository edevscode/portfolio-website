import React from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import { useReveal } from '../../../hooks/useReveal'
import './Skills.css'

export default function Skills({ skills }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()
  const [revealRef, visible] = useReveal()
  const list = Array.isArray(skills) ? skills : []
  if (list.length === 0) return null

  const colors = theme ? {
    primary:    theme.primary_color    || seasonConfig?.colors?.primary    || '#1a472a',
    accent:     theme.accent_color     || seasonConfig?.colors?.accent     || '#6366f1',
    background: theme.background_color || seasonConfig?.colors?.background || '#ffffff',
    text:       theme.text_color       || seasonConfig?.colors?.text       || '#1e293b',
    secondary:  theme.secondary_color  || seasonConfig?.colors?.secondary  || '#f1f5f9',
  } : {
    primary:    seasonConfig?.colors?.primary    || '#1a472a',
    accent:     seasonConfig?.colors?.accent     || '#6366f1',
    background: seasonConfig?.colors?.background || '#ffffff',
    text:       seasonConfig?.colors?.text       || '#1e293b',
    secondary:  seasonConfig?.colors?.secondary  || '#f1f5f9',
  }

  return (
    <section
      ref={revealRef}
      className={`skills pv-reveal${visible ? ' pv-reveal--visible' : ''}`}
      id="skills"
      style={{
        '--sp':  colors.primary,
        '--sa':  colors.accent,
        '--sb':  colors.background,
        '--st':  colors.text,
        '--sbg': colors.secondary,
      }}
    >
      <div className="skills-inner">

        <div className="skills-heading">
          <div>
            <span className="pv-section-eyebrow skills-label">
              <span className="pv-section-eyebrow-num">04</span>
              <span>Toolkit</span>
            </span>
            <h2 className="skills-title">Skills &amp; Technologies</h2>
          </div>
          <span className="skills-count">
            {list.length} {list.length === 1 ? 'skill' : 'skills'}
          </span>
        </div>

        <ul className="skills-container">
          {list.map((skill, idx) => (
            <li
              key={skill.id}
              className="skill-badge"
              style={visible ? { transitionDelay: `${Math.min(idx * 25, 350)}ms` } : undefined}
            >
              <span className="skill-dot" aria-hidden="true" />
              <span className="skill-name">{skill.name}</span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}
