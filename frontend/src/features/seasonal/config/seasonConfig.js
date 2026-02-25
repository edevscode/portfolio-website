/**
 * SEASONAL UI CONFIGURATION
 * 
 * Defines all seasonal properties, animations, particles, and visual effects
 * Supports: Winter, Spring, Summer, Fall + Holiday overrides
 * 
 * @example
 * const { season, config } = useSeasonContext()
 * const effects = SEASON_CONFIG[season]
 */

export const SEASON_CONFIG = {
  winter: {
    name: 'Winter',
    monthRange: { start: 12, end: 3, startDay: 21, endDay: 20 },
    colors: {
      primary: '#1a472a',
      secondary: '#e8f4f8',
      accent: '#4da6ff',
      background: '#f0f8ff',
      text: '#1a472a',
    },
    lottie: {
      name: 'snowflakes',
      src: '/animations/winter.json',
      size: { width: 300, height: 300 },
      loop: true,
      autoplay: true,
      speed: 0.8,
    },
    particles: {
      enabled: true,
      type: 'snowflakes',
      count: 30,
      options: {
        color: '#e8f4f8',
        size: 4,
        opacity: 0.8,
        fallSpeed: 1.5,
        windForce: 0.5,
      },
    },
    effects: {
      blur: 2,
      brightness: 1.05,
      saturation: 0.95,
    },
    accessibility: {
      description: 'Winter season with snowflakes and cool tones',
      motionIntensity: 'low',
    },
  },

  spring: {
    name: 'Spring',
    monthRange: { start: 3, end: 6, startDay: 21, endDay: 20 },
    colors: {
      primary: '#2d6a4f',
      secondary: '#fff1e6',
      accent: '#d62828',
      background: '#f5fbf0',
      text: '#1b4332',
    },
    lottie: {
      name: 'flowers',
      src: '/animations/spring.json',
      size: { width: 280, height: 280 },
      loop: true,
      autoplay: true,
      speed: 1,
    },
    particles: {
      enabled: true,
      type: 'petals',
      count: 25,
      options: {
        colors: ['#d62828', '#f77f00', '#fcbf49'],
        size: 6,
        opacity: 0.7,
        fallSpeed: 1,
        windForce: 1,
        rotation: true,
      },
    },
    effects: {
      blur: 1,
      brightness: 1.1,
      saturation: 1.1,
    },
    accessibility: {
      description: 'Spring season with floating flower petals',
      motionIntensity: 'medium',
    },
  },

  summer: {
    name: 'Summer',
    monthRange: { start: 6, end: 9, startDay: 21, endDay: 22 },
    colors: {
      primary: '#004e89',
      secondary: '#fff9e6',
      accent: '#f77f00',
      background: '#fffbf0',
      text: '#1a1a1a',
    },
    lottie: {
      name: 'sun',
      src: '/animations/summer.json',
      size: { width: 300, height: 300 },
      loop: true,
      autoplay: true,
      speed: 0.5,
    },
    particles: {
      enabled: true,
      type: 'light-particles',
      count: 20,
      options: {
        color: '#ffd60a',
        size: 3,
        opacity: 0.6,
        fallSpeed: 0.5,
        windForce: 0.3,
        float: true, // Floating effect instead of falling
      },
    },
    effects: {
      blur: 0,
      brightness: 1.15,
      saturation: 1.05,
    },
    accessibility: {
      description: 'Summer season with bright sun and light particles',
      motionIntensity: 'low',
    },
  },

  fall: {
    name: 'Fall',
    monthRange: { start: 9, end: 12, startDay: 23, endDay: 20 },
    colors: {
      primary: '#5c4033',
      secondary: '#fff5e1',
      accent: '#d2691e',
      background: '#faf6f1',
      text: '#3e2723',
    },
    lottie: {
      name: 'leaves',
      src: '/animations/fall.json',
      size: { width: 280, height: 280 },
      loop: true,
      autoplay: true,
      speed: 0.9,
    },
    particles: {
      enabled: true,
      type: 'leaves',
      count: 35,
      options: {
        colors: ['#d2691e', '#cd5c5c', '#daa520', '#8b4513'],
        size: 8,
        opacity: 0.8,
        fallSpeed: 2,
        windForce: 1.2,
        rotation: true,
        rotationSpeed: 8,
      },
    },
    effects: {
      blur: 1,
      brightness: 1,
      saturation: 1.15,
    },
    accessibility: {
      description: 'Fall season with falling autumn leaves',
      motionIntensity: 'medium',
    },
  },

  // HOLIDAY OVERRIDES - Takes precedence over season
  christmas: {
    name: 'Christmas',
    monthRange: { start: 12, end: 12, startDay: 20, endDay: 31 },
    colors: {
      primary: '#c41e3a',
      secondary: '#fff8dc',
      accent: '#ffd700',
      background: '#f0f8ff',
      text: '#165b33',
    },
    lottie: {
      name: 'christmas',
      src: '/animations/christmas.json',
      size: { width: 300, height: 300 },
      loop: true,
      autoplay: true,
      speed: 1,
    },
    particles: {
      enabled: true,
      type: 'snow-and-stars',
      count: 40,
      options: {
        color: '#e8f4f8',
        size: 5,
        opacity: 0.9,
        fallSpeed: 1.8,
        windForce: 0.6,
        sparkle: true,
      },
    },
    effects: {
      blur: 2,
      brightness: 1.1,
      saturation: 1.2,
    },
    accessibility: {
      description: 'Christmas holiday with festive decorations and snow',
      motionIntensity: 'medium',
    },
  },

  halloween: {
    name: 'Halloween',
    monthRange: { start: 10, end: 10, startDay: 25, endDay: 31 },
    colors: {
      primary: '#2d1b4e',
      secondary: '#f4e4d7',
      accent: '#ff6b35',
      background: '#1a0f2e',
      text: '#ff6b35',
    },
    lottie: {
      name: 'halloween',
      src: '/animations/halloween.json',
      size: { width: 300, height: 300 },
      loop: true,
      autoplay: true,
      speed: 1.1,
    },
    particles: {
      enabled: true,
      type: 'pumpkins',
      count: 20,
      options: {
        color: '#ff6b35',
        size: 12,
        opacity: 0.7,
        fallSpeed: 1.5,
        windForce: 0.8,
      },
    },
    effects: {
      blur: 2,
      brightness: 0.95,
      saturation: 1.1,
    },
    accessibility: {
      description: 'Halloween season with spooky decorations',
      motionIntensity: 'medium',
    },
  },

  valentine: {
    name: "Valentine's Day",
    monthRange: { start: 2, end: 2, startDay: 10, endDay: 18 },
    colors: {
      primary: '#c71585',
      secondary: '#ffe4e1',
      accent: '#ff1493',
      background: '#fff0f5',
      text: '#8b0000',
    },
    lottie: {
      name: 'hearts',
      src: '/animations/valentine.json',
      size: { width: 280, height: 280 },
      loop: true,
      autoplay: true,
      speed: 1.2,
    },
    particles: {
      enabled: true,
      type: 'hearts',
      count: 20,
      options: {
        color: '#ff1493',
        size: 10,
        opacity: 0.8,
        fallSpeed: 1.2,
        windForce: 0.5,
      },
    },
    effects: {
      blur: 1,
      brightness: 1.05,
      saturation: 1.15,
    },
    accessibility: {
      description: "Valentine's Day with floating hearts",
      motionIntensity: 'low',
    },
  },

  cny: {
    name: 'Chinese New Year',
    monthRange: { start: 1, end: 2, startDay: 20, endDay: 20 },
    colors: {
      primary: '#d62828',
      secondary: '#fff1c1',
      accent: '#ffd700',
      background: '#1a0f2e',
      text: '#ffd700',
    },
    lottie: {
      name: 'cny',
      src: '/animations/cny.json',
      size: { width: 300, height: 300 },
      loop: true,
      autoplay: true,
      speed: 1,
    },
    particles: {
      enabled: true,
      type: 'sparkles',
      count: 25,
      options: {
        colors: ['#ffd700', '#d4af37', '#ff006e'],
        size: 3,
        opacity: 0.7,
        fallSpeed: 0.8,
        windForce: 0.6,
        float: true,
      },
    },
    effects: {
      blur: 1,
      brightness: 1.1,
      saturation: 1.2,
    },
    accessibility: {
      description: 'Chinese New Year celebration with lanterns and dragon motifs',
      motionIntensity: 'medium',
    },
  },

  newyear: {
    name: 'New Year',
    monthRange: { start: 1, end: 1, startDay: 1, endDay: 7 },
    colors: {
      primary: '#1a1a2e',
      secondary: '#ffd700',
      accent: '#ff006e',
      background: '#0f3460',
      text: '#ffd700',
    },
    lottie: {
      name: 'fireworks',
      src: '/animations/newyear.json',
      size: { width: 300, height: 300 },
      loop: true,
      autoplay: true,
      speed: 1.3,
    },
    particles: {
      enabled: true,
      type: 'confetti',
      count: 50,
      options: {
        colors: ['#ffd700', '#ff006e', '#00d4ff', '#ff1493'],
        size: 6,
        opacity: 0.9,
        fallSpeed: 2,
        windForce: 1,
        rotation: true,
      },
    },
    effects: {
      blur: 0,
      brightness: 1.2,
      saturation: 1.2,
    },
    accessibility: {
      description: 'New Year celebration with fireworks and confetti',
      motionIntensity: 'high',
    },
  },

  new_year: null,
  autumn: null,
}

/**
 * Get current season based on date
 * Automatically handles holiday overrides
 * 
 * @returns {string} Season key ('winter', 'spring', 'summer', 'fall', or holiday)
 */
export const getCurrentSeason = () => {
  const today = new Date()
  const month = today.getMonth() + 1 // 1-12
  const day = today.getDate()

  // Check holidays first (they override seasons)
  if (month === 12 && day >= 20) return 'christmas'
  if (month === 10 && day >= 25) return 'halloween'
  if (month === 2 && day >= 10 && day <= 18) return 'valentine'
  if (month === 1 && day <= 7) return 'newyear'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 10)) return 'cny'

  // Return season
  if ((month === 12 && day >= 21) || month === 1 || month === 2 || (month === 3 && day <= 20)) {
    return 'winter'
  } else if ((month === 3 && day >= 21) || month === 4 || month === 5 || (month === 6 && day <= 20)) {
    return 'spring'
  } else if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 22)) {
    return 'summer'
  } else {
    return 'fall'
  }
}

/**
 * Get season configuration by key
 * 
 * @param {string} season - Season key
 * @returns {object} Season configuration
 */
export const getSeasonConfig = (season) => {
  if (season === 'new_year') return SEASON_CONFIG.newyear
  if (season === 'autumn') return SEASON_CONFIG.fall
  return SEASON_CONFIG[season] || SEASON_CONFIG.fall
}

/**
 * Get all available seasons
 * 
 * @returns {array} Array of season keys
 */
export const getAvailableSeasons = () => {
  return Object.keys(SEASON_CONFIG)
}

export default SEASON_CONFIG
