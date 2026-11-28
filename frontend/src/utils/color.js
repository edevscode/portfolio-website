export function normalizeHex(hexColor, fallback = null) {
  if (!hexColor || typeof hexColor !== 'string') return fallback
  let hex = hexColor.trim()
  if (!hex.startsWith('#')) hex = `#${hex}`
  const raw = hex.slice(1)
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toLowerCase()
  }
  if (/^[0-9a-fA-F]{4}$/.test(raw)) {
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toLowerCase()
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw}`.toLowerCase()
  }
  if (/^[0-9a-fA-F]{8}$/.test(raw)) {
    return `#${raw.slice(0, 6)}`.toLowerCase()
  }
  return fallback
}

export function hexToRgb(hexColor) {
  const norm = normalizeHex(hexColor)
  if (!norm) return null
  return [
    parseInt(norm.slice(1, 3), 16),
    parseInt(norm.slice(3, 5), 16),
    parseInt(norm.slice(5, 7), 16),
  ]
}

export function rgbToHex(r, g, b) {
  const clampByte = (v) => Math.max(0, Math.min(255, Math.round(v)))
  return (
    '#' +
    [clampByte(r), clampByte(g), clampByte(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  )
}

function rgbToHsl(r, g, b) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
        break
    }
    h /= 6
  }
  return [h * 360, s, l]
}

function hslToRgb(h, s, l) {
  const hn = (((h % 360) + 360) % 360) / 360
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const hue2rgb = (p, q, t) => {
    let tn = t
    if (tn < 0) tn += 1
    if (tn > 1) tn -= 1
    if (tn < 1 / 6) return p + (q - p) * 6 * tn
    if (tn < 1 / 2) return q
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, hn) * 255),
    Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  ]
}

export function getRelativeLuminance(hexColor) {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return null
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function getContrastRatio(hexA, hexB) {
  const lumA = getRelativeLuminance(hexA)
  const lumB = getRelativeLuminance(hexB)
  if (lumA === null || lumB === null) return null
  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)
  return (lighter + 0.05) / (darker + 0.05)
}

export function mixHex(hexA, weightA, hexB) {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  if (!a || !b) return normalizeHex(hexA) || normalizeHex(hexB) || '#000000'
  const w1 = Math.max(0, Math.min(1, weightA))
  const w2 = 1 - w1
  return rgbToHex(a[0] * w1 + b[0] * w2, a[1] * w1 + b[1] * w2, a[2] * w1 + b[2] * w2)
}

export function hexToRgba(hexColor, alpha) {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
}

/**
 * Picks a light or dark foreground hex guaranteed to maximize WCAG 2.1 contrast
 * against the given background color(s). Falls back to #000000 in the narrow
 * mid-luminance band where both #ffffff and #111827 fall slightly below 4.5:1.
 */
export function getReadableTextColor(hexColors, { light = '#ffffff', dark = '#111827' } = {}) {
  const colors = Array.isArray(hexColors) ? hexColors : [hexColors]
  const valid = colors.map((c) => normalizeHex(c)).filter(Boolean)
  if (!valid.length) return light

  const lums = valid.map(getRelativeLuminance).filter((v) => v !== null)
  if (!lums.length) return light

  const avgLum = lums.reduce((a, b) => a + b, 0) / lums.length
  const lightLum = getRelativeLuminance(light) ?? 1
  const darkLum = getRelativeLuminance(dark) ?? 0.01

  const contrastLight = (Math.max(lightLum, avgLum) + 0.05) / (Math.min(lightLum, avgLum) + 0.05)
  const contrastDark = (Math.max(darkLum, avgLum) + 0.05) / (Math.min(darkLum, avgLum) + 0.05)

  if (contrastLight >= 4.5 || contrastDark >= 4.5) {
    return contrastLight >= contrastDark ? light : dark
  }

  // Mid-luminance band (e.g. #e91e63): pure black guarantees >= 4.58:1 when white/slate fall just short
  const contrastBlack = (avgLum + 0.05) / 0.05
  if (contrastBlack >= contrastLight && contrastBlack >= 4.5) {
    return '#000000'
  }
  return contrastLight >= contrastDark ? light : dark
}

/**
 * Preserves preferredHex verbatim whenever it meets minRatio against bgHex.
 * Only when contrast is insufficient does it nudge lightness along the same hue,
 * falling back to fallbackHex / getReadableTextColor(bgHex) if unreachable.
 */
export function ensureReadableColor(preferredHex, bgHex, fallbackHex = null, minRatio = 4.5) {
  const pref = normalizeHex(preferredHex)
  const bg = normalizeHex(bgHex)
  if (!pref || !bg) return pref || normalizeHex(fallbackHex) || '#111827'

  const existing = getContrastRatio(pref, bg)
  if (existing !== null && existing >= minRatio) {
    return pref
  }

  const rgb = hexToRgb(pref)
  const bgLum = getRelativeLuminance(bg)
  if (!rgb || bgLum === null) {
    return normalizeHex(fallbackHex) || getReadableTextColor(bg)
  }

  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2])
  const preferLighterFirst = bgLum < 0.18
  const directions = preferLighterFirst ? [1, -1] : [-1, 1]

  for (const dir of directions) {
    for (let step = 1; step <= 100; step++) {
      const nextL = Math.max(0, Math.min(1, l + dir * (step / 100)))
      const [nr, ng, nb] = hslToRgb(h, s, nextL)
      const candidate = rgbToHex(nr, ng, nb)
      const ratio = getContrastRatio(candidate, bg)
      if (ratio !== null && ratio >= minRatio) {
        return candidate
      }
      if ((dir === 1 && nextL >= 1) || (dir === -1 && nextL <= 0)) break
    }
  }

  const fb = normalizeHex(fallbackHex)
  if (fb) {
    const fbRatio = getContrastRatio(fb, bg)
    if (fbRatio !== null && fbRatio >= minRatio) return fb
  }
  return getReadableTextColor(bg)
}

/**
 * Uses secondaryHex as the card/alternate-section surface whenever textHex
 * achieves >= minRatio against it. Otherwise derives a clean subtle elevated
 * surface from bgHex guaranteed to stay readable with textHex.
 */
export function deriveSurfaceColor(bgHex, secondaryHex, textHex, minRatio = 4.5) {
  const bg = normalizeHex(bgHex, '#f5f5f5')
  const sec = normalizeHex(secondaryHex)
  const txt = normalizeHex(textHex, '#111827')

  if (sec) {
    const secRatio = getContrastRatio(txt, sec)
    if (secRatio !== null && secRatio >= minRatio) {
      return sec
    }
  }

  const bgRgb = hexToRgb(bg)
  const bgLum = getRelativeLuminance(bg) ?? 0.9
  if (!bgRgb) return bg

  const [h, s, l] = rgbToHsl(bgRgb[0], bgRgb[1], bgRgb[2])
  const isDark = bgLum < 0.25
  const offsets = isDark ? [0.06, 0.04, 0.09, 0.02] : [0.04, -0.04, -0.06, 0.02]

  for (const delta of offsets) {
    const nextL = Math.max(0.03, Math.min(0.98, l + delta))
    if (Math.abs(nextL - l) < 0.015) continue
    const [nr, ng, nb] = hslToRgb(h, Math.min(s, 0.35), nextL)
    const candidate = rgbToHex(nr, ng, nb)
    const ratio = getContrastRatio(txt, candidate)
    if (ratio !== null && ratio >= minRatio) {
      return candidate
    }
  }

  return bg
}

/**
 * Produces a visually subordinate secondary text color that still meets WCAG AA
 * (>= minRatio) against bgHex, replacing fragile CSS opacity muting.
 */
export function deriveMutedText(textHex, bgHex, minRatio = 4.5) {
  const txt = ensureReadableColor(textHex, bgHex, getReadableTextColor(bgHex), minRatio)
  const bg = normalizeHex(bgHex, '#ffffff')

  const weights = [0.74, 0.78, 0.82, 0.86, 0.9, 0.94, 0.97]
  for (const w of weights) {
    const candidate = mixHex(txt, w, bg)
    const ratio = getContrastRatio(candidate, bg)
    if (ratio !== null && ratio >= minRatio) {
      return candidate
    }
  }
  return txt
}

/**
 * Resolves a theme record into both normalized raw colors and WCAG-verified
 * semantic tokens used across Portfolio Viewer components.
 */
export function resolveThemeTokens(themeData = {}) {
  const primary = normalizeHex(themeData.primary_color, '#000000')
  const secondary = normalizeHex(themeData.secondary_color, '#ffffff')
  const accent = normalizeHex(themeData.accent_color, '#0066cc')
  const bg = normalizeHex(themeData.background_color, '#f5f5f5')
  const rawText = normalizeHex(themeData.text_color, '#333333')

  const isDarkBg = (getRelativeLuminance(bg) ?? 0.9) < 0.25
  const text = ensureReadableColor(rawText, bg, getReadableTextColor(bg), 4.5)
  const textMuted = deriveMutedText(text, bg, 4.5)

  const surface = deriveSurfaceColor(bg, secondary, text, 4.5)
  const isDarkSurface = (getRelativeLuminance(surface) ?? 0.9) < 0.25
  const surfaceText = ensureReadableColor(text, surface, getReadableTextColor(surface), 4.5)
  const surfaceMuted = deriveMutedText(surfaceText, surface, 4.5)

  const heading = ensureReadableColor(primary, bg, text, 4.5)
  const headingOnSurface = ensureReadableColor(primary, surface, surfaceText, 4.5)

  const accentText = ensureReadableColor(accent, bg, heading, 4.5)
  const accentOnSurface = ensureReadableColor(accent, surface, headingOnSurface, 4.5)

  const onPrimary = getReadableTextColor(primary)
  const onAccent = getReadableTextColor(accent)
  const onPrimaryMuted = hexToRgba(onPrimary, 0.78)
  const onPrimaryBorder = hexToRgba(onPrimary, 0.22)

  const border = hexToRgba(text, isDarkBg ? 0.18 : 0.12)
  const borderStrong = hexToRgba(text, isDarkBg ? 0.3 : 0.22)
  const surfaceBorder = hexToRgba(surfaceText, isDarkSurface ? 0.18 : 0.12)
  const tint = hexToRgba(text, isDarkBg ? 0.08 : 0.05)
  const surfaceTint = hexToRgba(surfaceText, isDarkSurface ? 0.09 : 0.05)

  return {
    primary,
    secondary,
    accent,
    background: bg,
    bg,
    text,
    textMuted,
    surface,
    surfaceText,
    surfaceMuted,
    heading,
    headingOnSurface,
    accentText,
    accentOnSurface,
    onPrimary,
    onAccent,
    onPrimaryMuted,
    onPrimaryBorder,
    border,
    borderStrong,
    surfaceBorder,
    tint,
    surfaceTint,
    isDarkBg,
    isDarkSurface,
  }
}
