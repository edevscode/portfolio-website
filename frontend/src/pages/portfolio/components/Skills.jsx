import React from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import './Skills.css'

export default function Skills({ skills }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()
  const list = Array.isArray(skills) ? skills : []

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
    <section className="skills" id="skills" style={{
      backgroundColor: colors.background
    }}>
      <div className="container">
        <h2 style={{ color: colors.primary }}>Skills</h2>
        <div className="skills-wrapper">
          <div className="skill-list">
            {list.map((skill) => (
              <div key={skill.id} className="skill-item">
                <div className="skill-name" style={{ color: colors.text }}>
                  {skill.name}
                </div>
                <div className="skill-bar" style={{
                  backgroundColor: colors.secondary
                }}>
                  <div className="skill-progress" style={{ 
                    width: `${skill.proficiency}%`,
                    backgroundColor: colors.accent
                  }}></div>
                </div>
                <span className="skill-percent" style={{ color: colors.text }}>
                  {skill.proficiency}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
