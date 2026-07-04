import React from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import './Skills.css'

export default function Skills({ skills }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()
  const list = Array.isArray(skills) ? skills : []

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
      className="skills"
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
          <span className="skills-label">Expertise</span>
          <h2 className="skills-title">Skills & Tools</h2>
          <p className="skills-subtitle">
            Technologies I work with to build great products
          </p>
        </div>

        <div className="skills-container">
          {list.map((skill, idx) => (
            <div
              key={skill.id}
              className="skill-badge"
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <span className="skill-name">{skill.name}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
