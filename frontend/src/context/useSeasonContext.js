/**
 * USE SEASON CONTEXT HOOK
 * 
 * Custom hook to access season context from any component
 * Includes error handling and TypeScript-like JSDoc
 * 
 * @example
 * const { season, config, animationsEnabled } = useSeasonContext()
 * 
 * if (season === 'winter') {
 *   return <WinterEffect />
 * }
 */

import { useContext } from 'react'
import { SeasonContext } from './SeasonContext'

/**
 * Hook to access season context
 * 
 * @returns {Object} Season context object
 * @returns {string} season - Current season ('winter', 'spring', 'summer', 'fall', or holiday)
 * @returns {Object} config - Season configuration object
 * @returns {Object} monthRange - Month/day range for current season
 * @returns {boolean} isAutoDetect - Whether using auto-detection
 * @returns {boolean} isLoading - Whether API is loading
 * @returns {string|null} error - Any API error message
 * @returns {function} setSeason - Set season manually
 * @returns {function} resetToAutoDetect - Reset to auto-detection
 * @returns {boolean} animationsEnabled - Whether animations are enabled (respects prefers-reduced-motion)
 * @returns {function} setAnimationsEnabled - Toggle animations
 * 
 * @throws {Error} If context is not available (must be inside SeasonProvider)
 */
export const useSeasonContext = () => {
  const context = useContext(SeasonContext)

  if (!context) {
    throw new Error(
      'useSeasonContext must be used within a SeasonProvider. ' +
        'Make sure your component is wrapped with <SeasonProvider> in your app.'
    )
  }

  return context
}

export default useSeasonContext
