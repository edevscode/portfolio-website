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
        <h2 style={{ color: colors.primary }}>Skills & Expertise</h2>
        <div className="skills-container">
          {list.map((skill) => (
            <div 
              key={skill.id} 
              className="skill-badge"
              style={{ 
                '--accent': colors.accent,
                '--primary': colors.primary,
                '--text': colors.text,
                '--secondary': colors.secondary
              }}
            >
              <span className="skill-name">{skill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
