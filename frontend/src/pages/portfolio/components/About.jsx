import React, { useMemo } from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import { useReveal } from '../../../hooks/useReveal'
import Prose from '../../../components/Prose'
import './About.css'

function hasVisibleText(val) {
  if (!val) return false
  return String(val)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim().length > 0
}

function calcTotalExperienceLabel(experiences) {
  if (!Array.isArray(experiences) || experiences.length === 0) return null
  let minStart = Infinity
  let maxEnd = 0
  const now = Date.now()
  for (const exp of experiences) {
    if (!exp?.start_date) continue
    const s = new Date(exp.start_date + 'T12:00:00').getTime()
    const e = exp.is_current || !exp.end_date ? now : new Date(exp.end_date + 'T12:00:00').getTime()
    if (!Number.isNaN(s) && s < minStart) minStart = s
    if (!Number.isNaN(e) && e > maxEnd) maxEnd = e
  }
  if (!Number.isFinite(minStart) || maxEnd <= minStart) return null
  const months = Math.max(1, Math.round((maxEnd - minStart) / (1000 * 60 * 60 * 24 * 30.4375)))
  const years = Math.floor(months / 12)
  if (years >= 1) return `${years}+ yr${years > 1 ? 's' : ''}`
  return `${months} mo`
}

export default function About({
  about,
  projectsCount = 0,
  experiences = [],
  certificatesCount = 0,
}) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()
  const [revealRef, visible] = useReveal()

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

  const showIntro = hasVisibleText(about?.about_intro)
  const showBackground = hasVisibleText(about?.about_background)
  const showSpecialization = hasVisibleText(about?.about_specialization)
  const showAboutText = hasVisibleText(about?.about_text)
  const hasDetailCards = showBackground || showSpecialization || showAboutText

  const quickFacts = useMemo(() => {
    const list = []
    const expLabel = calcTotalExperienceLabel(experiences)
    if (expLabel) list.push({ value: expLabel, label: 'Experience' })
    if (projectsCount > 0) list.push({ value: String(projectsCount), label: projectsCount === 1 ? 'Project' : 'Projects' })
    if (certificatesCount > 0) list.push({ value: String(certificatesCount), label: certificatesCount === 1 ? 'Credential' : 'Credentials' })
    return list
  }, [experiences, projectsCount, certificatesCount])

  return (
    <section
      ref={revealRef}
      className={`about pv-reveal${visible ? ' pv-reveal--visible' : ''}`}
      id="about"
      style={{
        '--ap': colors.primary,
        '--aa': colors.accent,
        '--ab': colors.background,
        '--at': colors.text,
        '--as': colors.secondary,
      }}
    >
      <div className="about-inner">
        <div className={`about-layout${hasDetailCards ? '' : ' about-layout--single'}`}>
          {/* ── Left column: editorial lead + metrics + resume ── */}
          <div className="about-lead">
            <div className="about-heading">
              <span className="pv-section-eyebrow about-label">
                <span className="pv-section-eyebrow-num">03</span>
                <span>About</span>
              </span>
              <h2 className="about-title">Who I Am</h2>
            </div>

            {showIntro && (
              <div className="about-intro-text">
                <Prose style={{ color: 'var(--theme-surface-text)' }}>{about.about_intro}</Prose>
              </div>
            )}

            {quickFacts.length > 0 && (
              <dl className="about-facts">
                {quickFacts.map((fact) => (
                  <div key={fact.label} className="about-fact">
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* ── Right column: structured narrative cards ── */}
          {hasDetailCards && (
            <div className="about-content">
              {showBackground && (
                <div className="about-block">
                  <div className="about-block-label">Background</div>
                  <Prose style={{ color: 'var(--theme-text)' }}>
                    {about.about_background}
                  </Prose>
                </div>
              )}

              {showSpecialization && (
                <div className="about-block">
                  <div className="about-block-label">Specialization</div>
                  <Prose style={{ color: 'var(--theme-text)' }}>
                    {about.about_specialization}
                  </Prose>
                </div>
              )}

              {showAboutText && (
                <div className="about-block">
                  <div className="about-block-label">Overview</div>
                  <Prose style={{ color: 'var(--theme-text)' }}>
                    {about.about_text}
                  </Prose>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
