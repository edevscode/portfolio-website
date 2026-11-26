import React, { useRef, useEffect } from 'react'
import './SimpleRichArea.css'

function stripOfficeMarkup(html) {
  return String(html || '')
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(xml|style|script)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/?[a-z]+:[a-z0-9_-]+[^>]*>/gi, '')
}

function cleanHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = stripOfficeMarkup(html)
  tmp.querySelectorAll('script,style,link,meta,iframe,object,embed,xml').forEach(el => el.remove())
  tmp.querySelectorAll('*').forEach(el => {
    const rawHref = el.tagName === 'A' ? el.getAttribute('href') : null
    const safeHref = rawHref && /^(https?:|mailto:|tel:|\/|#)/i.test(rawHref.trim()) ? rawHref.trim() : null
    Array.from(el.attributes).forEach(a => el.removeAttribute(a.name))
    if (safeHref) el.setAttribute('href', safeHref)
  })
  return tmp.innerHTML.trim()
}

export default function SimpleRichArea({ value = '', onChange, name, placeholder, rows = 4, className = '' }) {
  const ref = useRef(null)
  const syncedValue = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cleaned = stripOfficeMarkup(value || '')
    el.innerHTML = cleaned
    syncedValue.current = value || ''
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || value === syncedValue.current) return
    el.innerHTML = stripOfficeMarkup(value || '')
    syncedValue.current = value || ''
  }, [value])

  const emit = () => {
    const raw = ref.current?.innerHTML ?? ''
    const plain = raw
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim()
    const html = plain.length === 0 && !/<img\b/i.test(raw) ? '' : raw
    syncedValue.current = html
    onChange({ target: { name, value: html } })
  }

  const handlePaste = (e) => {
    const html = e.clipboardData?.getData('text/html')
    if (!html) return
    const clean = cleanHtml(html)
    if (!clean) return
    e.preventDefault()
    document.execCommand('insertHTML', false, clean)
    emit()
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={emit}
      onPaste={handlePaste}
      data-placeholder={placeholder}
      className={`sra ${className}`}
      style={{ minHeight: `${(rows || 4) * 26}px` }}
    />
  )
}
