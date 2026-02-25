/**
 * SEASON CONTEXT & PROVIDER
 * 
 * Manages global season state with auto-detection and API sync
 * Provides hooks and context for all season-aware components
 * 
 * Features:
 * - Auto-detect current season from date
 * - Sync with Django API (optional)
 * - Manual season override for testing
 * - Memoized to prevent unnecessary re-renders
 * - Respects prefers-reduced-motion
 * 
 * @example
 * import { SeasonProvider } from './context/SeasonContext'
 * 
 * <SeasonProvider>
 *   <App />
 * </SeasonProvider>
 */

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { getCurrentSeason, getSeasonConfig } from '../features/seasonal/config/seasonConfig'

// Create context
export const SeasonContext = createContext({
  season: 'fall',
  config: {},
  monthRange: {},
  isLoading: false,
  error: null,
  setSeason: () => {},
  resetToAutoDetect: () => {},
  animationsEnabled: true,
  setAnimationsEnabled: () => {},
})

/**
 * SEASON PROVIDER COMPONENT
 * 
 * Wraps application with season management
 */
export const SeasonProvider = ({ children, apiUrl = null }) => {
  // Season state
  const [season, setSeason] = useState(() => getCurrentSeason())
  const [isAutoDetect, setIsAutoDetect] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Accessibility state - respects system preference
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return !prefersReduced
  })

  // Get current season config
  const config = useMemo(() => getSeasonConfig(season), [season])

  /**
   * Set season manually (useful for testing/override)
   */
  const handleSetSeason = useCallback((newSeason) => {
    setSeason(newSeason)
    setIsAutoDetect(false)
  }, [])

  /**
   * Reset to auto-detection based on current date
   */
  const handleResetToAutoDetect = useCallback(() => {
    setSeason(getCurrentSeason())
    setIsAutoDetect(true)
  }, [])

  /**
   * Handle prefers-reduced-motion changes
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleChange = (e) => {
      setAnimationsEnabled(!e.matches)
    }

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  /**
   * Sync with Django API (optional)
   * Fetch current season from backend if provided
   */
  useEffect(() => {
    if (!apiUrl || !isAutoDetect) return

    const syncWithAPI = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiUrl}/api/seasons/current/`)
        if (!response.ok) throw new Error('Failed to fetch season from API')

        const data = await response.json()
        if (data.season) {
          setSeason(data.season)
        }
      } catch (err) {
        // Silently fail - use auto-detected season
        console.warn('Season API sync failed, using auto-detection:', err.message)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    // Sync on mount and once per day
    syncWithAPI()

    const dailySync = setInterval(syncWithAPI, 24 * 60 * 60 * 1000) // 24 hours

    return () => clearInterval(dailySync)
  }, [apiUrl, isAutoDetect])

  /**
   * Auto-update season at midnight if auto-detect is enabled
   * Useful for catching season changes without page refresh
   */
  useEffect(() => {
    if (!isAutoDetect) return

    const checkSeasonChange = () => {
      const newSeason = getCurrentSeason()
      if (newSeason !== season) {
        setSeason(newSeason)
      }
    }

    // Check every minute
    const interval = setInterval(checkSeasonChange, 60 * 1000)

    return () => clearInterval(interval)
  }, [season, isAutoDetect])

  // Context value
  const contextValue = useMemo(
    () => ({
      season,
      config,
      monthRange: config.monthRange || {},
      isAutoDetect,
      isLoading,
      error,
      setSeason: handleSetSeason,
      resetToAutoDetect: handleResetToAutoDetect,
      animationsEnabled,
      setAnimationsEnabled,
    }),
    [season, config, isAutoDetect, isLoading, error, animationsEnabled, handleSetSeason, handleResetToAutoDetect]
  )

  return <SeasonContext.Provider value={contextValue}>{children}</SeasonContext.Provider>
}

export default SeasonContext
