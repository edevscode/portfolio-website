/**
 * SEASONAL EFFECTS COMPONENT
 * 
 * Main component that renders all seasonal visual effects
 * Includes:
 * - Lottie animations (when Lottie is available)
 * - Particle effects
 * - Seasonal styling
 * - Accessibility support (respects prefers-reduced-motion)
 * 
 * @example
 * <SeasonalEffects position="top-right" />
 * <SeasonalEffects type="background" />
 */

import React, { useMemo } from 'react'
import { useSeasonContext } from '../../../context/useSeasonContext'
import ParticleEffect from './ParticleEffect'
import '../styles/seasonal.css'

const SeasonalEffects = ({
  position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'center'
  type = 'decorative', // 'decorative' or 'background'
  scale = 1,
  showParticles = true,
  customLottieComponent = null, // Allow custom Lottie component
}) => {
  const { season, config, animationsEnabled } = useSeasonContext()

  if (!animationsEnabled) {
    return null
  }

  const positionClass = `seasonal-effect--${position}`
  const effectClass = `seasonal-effect--${type}`

  return (
    <div className={`seasonal-effect ${positionClass} ${effectClass}`} style={{ '--scale': scale }}>
      {/* LOTTIE ANIMATION */}
      {customLottieComponent && config.lottie && (
        <div className="seasonal-effect__lottie">
          {customLottieComponent({
            animationData: config.lottie,
            season,
          })}
        </div>
      )}

      {/* PARTICLE EFFECTS */}
      {showParticles && config.particles?.enabled && (
        <ParticleEffect
          type={config.particles.type}
          count={config.particles.count}
          options={config.particles.options}
          enabled={animationsEnabled}
        />
      )}

      {/* DECORATIVE ELEMENT */}
      <div className="seasonal-effect__decoration" aria-hidden="true" />
    </div>
  )
}

/**
 * SEASONAL BACKGROUND COMPONENT
 * Renders particles and background effects for the entire page
 * Always shows seasonal elements, but uses theme colors if available
 */
export const SeasonalBackground = ({ customLottieComponent = null, showParticles = true, themeColors = null }) => {
  const { season, config, animationsEnabled } = useSeasonContext()

  if (!animationsEnabled) {
    return null
  }

  return (
    <div className="seasonal-background" aria-label={`${config.name} background effects`}>
      {/* FULL-PAGE PARTICLES - Always show seasonal particles, with optional theme coloring */}
      {showParticles && config.particles?.enabled && (
        <ParticleEffect
          type={config.particles.type}
          count={config.particles.count}
          options={config.particles.options}
          enabled={animationsEnabled}
          particleColor={themeColors?.primary}
        />
      )}

      {/* BACKGROUND GRADIENT/FILTER */}
      <div
        className="seasonal-background__filter"
        style={{
          '--blur': config.effects?.blur ? `${config.effects.blur}px` : '0px',
          '--brightness': config.effects?.brightness ? `${config.effects.brightness}` : '1',
          '--saturation': config.effects?.saturation ? `${config.effects.saturation}` : '1',
        }}
      />
    </div>
  )
}

/**
 * SEASONAL HEADER COMPONENT
 * Renders Lottie animation in header area
 */
export const SeasonalHeader = ({
  customLottieComponent = null,
  position = 'right',
  size = 200,
}) => {
  const { config, animationsEnabled } = useSeasonContext()

  if (!animationsEnabled || !config.lottie) {
    return null
  }

  return (
    <div
      className={`seasonal-header seasonal-header--${position}`}
      style={{
        '--size': `${size}px`,
      }}
    >
      {customLottieComponent && (
        <div className="seasonal-header__animation">
          {customLottieComponent({
            animationData: config.lottie,
          })}
        </div>
      )}
    </div>
  )
}

/**
 * ANIMATION TOGGLE COMPONENT
 * Allows users to toggle seasonal animations
 */
export const AnimationToggle = () => {
  const { animationsEnabled, setAnimationsEnabled, config } = useSeasonContext()

  return (
    <div className="animation-toggle">
      <label className="animation-toggle__label">
        <input
          type="checkbox"
          checked={animationsEnabled}
          onChange={(e) => setAnimationsEnabled(e.target.checked)}
          className="animation-toggle__input"
        />
        <span className="animation-toggle__text">
          {animationsEnabled ? `Show ${config.name} effects` : 'Animations disabled'}
        </span>
      </label>
    </div>
  )
}

/**
 * SEASON INFORMATION COMPONENT
 * Displays current active theme/season and allows manual override
 */
export const SeasonInfo = ({ onSeasonChange = null, theme = null, isAdminThemeActive = false }) => {
  const { season, config, isAutoDetect, setSeason, resetToAutoDetect } = useSeasonContext()

  return (
    <div className="season-info">
      <div className="season-info__current">
        {isAdminThemeActive && theme ? (
          <>
            <span className="season-info__label">Active Theme:</span>
            <span className="season-info__value">{theme.name || 'Custom Theme'}</span>
          </>
        ) : (
          <>
            <span className="season-info__label">Current Season:</span>
            <span className="season-info__value">{config.name}</span>
          </>
        )}
      </div>

      {!isAdminThemeActive && !isAutoDetect && (
        <button onClick={resetToAutoDetect} className="season-info__reset">
          Reset to Auto-Detect
        </button>
      )}
    </div>
  )
}

export default SeasonalEffects
