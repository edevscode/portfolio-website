import React, { useRef, useEffect } from 'react'
import { sanitizeHtml } from '../utils/sanitize'
import './SimpleRichArea.css'

export default function SimpleRichArea({ value = '', onChange, name, placeholder, rows = 4, className = '' }) {
  const ref = useRef(null)
  const syncedValue = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = sanitizeHtml(value || '')
    syncedValue.current = value || ''
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || value === syncedValue.current) return
    el.innerHTML = sanitizeHtml(value || '')
    syncedValue.current = value || ''
  }, [value])

  const emit = () => {
    const raw = ref.current?.innerHTML ?? ''
    const sanitized = sanitizeHtml(raw)
    const plain = sanitized
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim()
    const html = plain.length === 0 ? '' : sanitized
    syncedValue.current = html
    onChange({ target: { name, value: html } })
  }

  const handlePaste = (e) => {
    const html = e.clipboardData?.getData('text/html')
    if (!html) return
    const clean = sanitizeHtml(html)
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
