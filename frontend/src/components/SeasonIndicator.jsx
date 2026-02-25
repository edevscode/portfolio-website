import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

/**
 * SeasonIndicator - Shows current season and theme mode
 * Useful for development/testing seasonal themes
 * Can be hidden in production
 */
export function SeasonIndicator({ showInProduction = false }) {
  const { theme, currentSeason, isAutoTheme, loading } = useTheme()

  if (loading) return null
  
  // Only show in development or if explicitly enabled for production
  const isDev = import.meta.env.DEV
  if (!isDev && !showInProduction) return null

  const seasonLabels = {
    spring: '🌸 Spring',
    summer: '☀️ Summer',
    autumn: '🍂 Autumn',
    winter: '❄️ Winter',
    new_year: '🎆 New Year',
    valentine: '💕 Valentine',
    easter: '🐰 Easter',
    halloween: '👻 Halloween',
    thanksgiving: '🦃 Thanksgiving',
    christmas: '🎄 Christmas',
    cny: '🧧 Chinese New Year',
    default: '⭐ Default',
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 999,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      maxWidth: '200px',
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
        {seasonLabels[currentSeason] || currentSeason}
      </div>
      <div style={{ fontSize: '11px', opacity: 0.8 }}>
        Mode: {isAutoTheme ? 'Auto' : 'Manual'}
      </div>
      {theme && (
        <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
          Theme: {theme.name}
        </div>
      )}
    </div>
  )
}

export default SeasonIndicator
