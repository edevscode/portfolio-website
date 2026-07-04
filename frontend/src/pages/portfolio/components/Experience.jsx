import React from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import Prose from '../../../components/Prose'
import './Experience.css'

function fmtDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function calcDuration(start, end, isCurrent) {
  if (!start) return ''
  const s = new Date(start + 'T12:00:00')
  const e = isCurrent || !end ? new Date() : new Date(end + 'T12:00:00')
  const total = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
  if (total < 1) return ''
  const y = Math.floor(total / 12)
  const m = total % 12
  if (y === 0) return `${m}mo`
  if (m === 0) return `${y}yr`
  return `${y}yr ${m}mo`
}

export default function Experience({ experiences }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()

  const colors = theme ? {
    primary:    theme.primary_color    || seasonConfig?.colors?.primary    || '#1a472a',
    background: theme.background_color || seasonConfig?.colors?.background || '#ffffff',
    text:       theme.text_color       || seasonConfig?.colors?.text       || '#1e293b',
    secondary:  theme.secondary_color  || seasonConfig?.colors?.secondary  || '#f1f5f9',
    accent:     theme.accent_color     || seasonConfig?.colors?.accent     || '#6366f1',
  } : {
    primary:    seasonConfig?.colors?.primary    || '#1a472a',
    background: seasonConfig?.colors?.background || '#ffffff',
    text:       seasonConfig?.colors?.text       || '#1e293b',
    secondary:  seasonConfig?.colors?.secondary  || '#f1f5f9',
    accent:     seasonConfig?.colors?.accent     || '#6366f1',
  }

  if (!experiences?.length) return null

  return (
    <section
      className="exp-section"
      id="experience"
      style={{
        '--ep': colors.primary,
        '--ea': colors.accent,
        '--eb': colors.background,
        '--et': colors.text,
        '--es': colors.secondary,
      }}
    >
      <div className="exp-container">

        {/* ── Section header ── */}
        <div className="exp-header">
          <span className="exp-tag">Career</span>
          <h2 className="exp-title">Work Experience</h2>
          <p className="exp-subtitle">My professional journey and the roles that shaped my skills</p>
        </div>

        {/* ── Timeline ── */}
        <div className="exp-timeline">
          {experiences.map((exp, idx) => {
            const dur = calcDuration(exp.start_date, exp.end_date, exp.is_current)
            const isLast = idx === experiences.length - 1
            return (
              <div key={exp.id} className="exp-item" style={{ animationDelay: `${idx * 0.1}s` }}>

                {/* Stem: dot + line */}
                <div className="exp-stem">
                  <div className="exp-dot">
                    <div className="exp-dot-inner" />
                  </div>
                  {!isLast && <div className="exp-line" />}
                </div>

                {/* Card */}
                <div className="exp-card">
                  <div className="exp-card-head">
                    <div className="exp-card-meta">
                      {exp.company && (
                        <span className="exp-company">{exp.company}</span>
                      )}
                      <span className="exp-date-range">
                        {fmtDate(exp.start_date)}
                        {' – '}
                        {exp.is_current ? 'Present' : fmtDate(exp.end_date)}
                        {dur && <span className="exp-duration">&nbsp;· {dur}</span>}
                      </span>
                    </div>
                    {exp.is_current && (
                      <span className="exp-badge-current">Current</span>
                    )}
                  </div>

                  <h3 className="exp-role">{exp.title}</h3>

                  {exp.description && (
                    <div className="exp-desc">
                      <Prose style={{ color: colors.text }}>{exp.description}</Prose>
                    </div>
                  )}
                </div>

              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
