function getLuminance(hexColor) {
  if (!hexColor || typeof hexColor !== 'string') return null
  const hex = hexColor.replace('#', '').trim()
  if (hex.length !== 3 && hex.length !== 6) return null
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if ([r, g, b].some(Number.isNaN)) return null
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

// Picks a light or dark text color readable against the given background
// color(s). Accepts a single hex color or an array (e.g. gradient endpoints),
// averaging their luminance.
export function getReadableTextColor(hexColors, { light = '#ffffff', dark = '#161616' } = {}) {
  const colors = Array.isArray(hexColors) ? hexColors : [hexColors]
  const luminances = colors.map(getLuminance).filter((v) => v !== null)
  if (!luminances.length) return light
  const avg = luminances.reduce((a, b) => a + b, 0) / luminances.length
  return avg > 0.55 ? dark : light
}
