const ALLOWED_TAGS = new Set([
  'p', 'br', 'div', 'span',
  'b', 'strong', 'i', 'em', 'u', 's', 'del',
  'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code', 'hr',
  'a', 'sub', 'sup',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
])

const DROP_SUBTREE_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed',
  'link', 'meta', 'xml', 'svg', 'math',
  'form', 'input', 'button', 'textarea', 'select', 'option',
])

export function stripOfficeMarkup(html) {
  return String(html || '')
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(xml|style|script)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/?[a-z]+:[a-z0-9_-]+[^>]*>/gi, '')
}

/**
 * Validates URLs before assigning to href attributes.
 * Permits http:, https:, mailto:, tel:, hash anchors (#), and single-slash relative paths (/).
 * Rejects javascript:, data:, vbscript:, protocol-relative (//), and control characters.
 */
export function safeHref(raw, fallback = null) {
  if (typeof raw !== 'string') return fallback
  // eslint-disable-next-line no-control-regex
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]+/g, '').trim()
  if (!cleaned) return fallback

  if (cleaned.startsWith('#')) return cleaned
  if (cleaned.startsWith('/') && !cleaned.startsWith('//')) return cleaned

  try {
    const parsed = new URL(cleaned)
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return cleaned
    }
  } catch {
    return fallback
  }
  return fallback
}

export function safeHexColor(raw, fallback = '#000000') {
  if (typeof raw !== 'string') return fallback
  const trimmed = raw.trim()
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)
    ? trimmed
    : fallback
}

function sanitizeNode(node, doc) {
  if (node.nodeType === 3) {
    return doc.createTextNode(node.nodeValue || '')
  }
  if (node.nodeType !== 1) {
    return null
  }

  const tag = node.tagName.toLowerCase()
  if (DROP_SUBTREE_TAGS.has(tag)) {
    return null
  }

  if (!ALLOWED_TAGS.has(tag)) {
    const frag = doc.createDocumentFragment()
    Array.from(node.childNodes).forEach((child) => {
      const cleanChild = sanitizeNode(child, doc)
      if (cleanChild) frag.appendChild(cleanChild)
    })
    return frag
  }

  const el = doc.createElement(tag)
  if (tag === 'a') {
    const href = safeHref(node.getAttribute('href'))
    if (href) {
      el.setAttribute('href', href)
      if (/^https?:/i.test(href)) {
        el.setAttribute('rel', 'noopener noreferrer')
      }
    }
  }

  Array.from(node.childNodes).forEach((child) => {
    const cleanChild = sanitizeNode(child, doc)
    if (cleanChild) el.appendChild(cleanChild)
  })
  return el
}

/**
 * Inert HTML sanitizer built on DOMParser with a strict tag/attribute allowlist.
 * Parses markup without executing inline event handlers or loading external resources.
 */
export function sanitizeHtml(raw) {
  const precleaned = stripOfficeMarkup(raw)
  if (!precleaned.trim()) return ''

  if (typeof DOMParser === 'undefined') {
    return precleaned.replace(/<[^>]+>/g, '').trim()
  }

  const parser = new DOMParser()
  const parsed = parser.parseFromString(precleaned, 'text/html')
  const outDoc = document.implementation.createHTMLDocument('')
  const container = outDoc.createElement('div')

  Array.from(parsed.body.childNodes).forEach((child) => {
    const cleanChild = sanitizeNode(child, outDoc)
    if (cleanChild) container.appendChild(cleanChild)
  })

  return container.innerHTML.trim()
}
