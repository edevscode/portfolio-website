import React from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import './Experience.css'

export default function Experience({ experiences }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()

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
    <section className="experience" id="experience" style={{
      backgroundColor: colors.background
    }}>
      <div className="container">
        <h2 style={{ color: colors.primary }}>Experience</h2>
        <div className="timeline">
          {experiences && experiences.map((exp) => (
            <div key={exp.id} className="timeline-item" style={{
              borderLeftColor: colors.accent
            }}>
              <div className="timeline-date" style={{
                color: colors.primary
              }}>
                <span>{exp.start_date}</span>
                {exp.end_date && <span> - {exp.end_date}</span>}
                {exp.is_current && <span className="current" style={{
                  backgroundColor: colors.accent
                }}>Current</span>}
              </div>
              <div className="timeline-marker" aria-hidden="true" />
              <div className="timeline-content" style={{
                backgroundColor: colors.secondary
              }}>
                <h3 style={{ color: colors.primary }}>
                  {exp.title}
                </h3>
                {exp.company ? (
                  <h4 style={{ color: colors.accent }}>
                    {exp.company}
                  </h4>
                ) : null}
                <p style={{ color: colors.text }}>
                  {exp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
