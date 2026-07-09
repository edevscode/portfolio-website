import React from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import Prose from '../../../components/Prose'
import './Testimonials.css'

export default function Testimonials({ testimonials }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()
  const visible = Array.isArray(testimonials) ? testimonials : []

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
      className="testi-section"
      id="testimonials"
      style={{
        '--tp': colors.primary,
        '--ta': colors.accent,
        '--tb': colors.background,
        '--tt': colors.text,
        '--ts': colors.secondary,
      }}
    >
      <div className="testi-inner">

        <div className="testi-heading">
          <span className="testi-label">Testimonials</span>
          <h2 className="testi-title">What Clients Say</h2>
          <p className="testi-subtitle">
            Trusted by professionals and clients who value quality work
          </p>
        </div>

        {visible.length === 0 ? (
          <p className="testi-empty">No testimonials yet.</p>
        ) : (
          <div className="testi-grid">
            {visible.map((t, idx) => (
              <div
                key={t.id}
                className="testi-card"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Quote icon */}
                <svg
                  className="testi-quote-icon"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                <Prose className="testi-quote">{t.quote}</Prose>

                {t.rating > 0 && (
                  <div className="testi-stars">
                    {[1, 2, 3, 4, 5].map(n => (
                      <span
                        key={n}
                        className={`testi-star${n > t.rating ? ' testi-star--empty' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}

                <div className="testi-client">
                  {t.client_photo ? (
                    <img
                      className="testi-avatar"
                      src={t.client_photo}
                      alt={t.client_name}
                    />
                  ) : (
                    <div className="testi-avatar-placeholder">
                      {t.client_name ? t.client_name[0].toUpperCase() : '?'}
                    </div>
                  )}
                  <div className="testi-client-info">
                    <p className="testi-client-name">{t.client_name}</p>
                    {t.client_role && (
                      <p className="testi-client-role">{t.client_role}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
