import React, { useRef, useEffect } from 'react'
import './SimpleRichArea.css'

function cleanHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
    .replace(/<!--StartFragment-->/g, '')
    .replace(/<!--EndFragment-->/g, '')
  tmp.querySelectorAll('script,style,link,meta,iframe,object,embed').forEach(el => el.remove())
  tmp.querySelectorAll('*').forEach(el => {
    const href = el.tagName === 'A' ? el.getAttribute('href') : null
    Array.from(el.attributes).forEach(a => el.removeAttribute(a.name))
    if (href) el.setAttribute('href', href)
  })
  return tmp.innerHTML.trim()
}

export default function SimpleRichArea({ value = '', onChange, name, placeholder, rows = 4, className = '' }) {
  const ref = useRef(null)
  const syncedValue = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = value || ''
    syncedValue.current = value || ''
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || value === syncedValue.current) return
    el.innerHTML = value || ''
    syncedValue.current = value || ''
  }, [value])

  const emit = () => {
    const html = ref.current?.innerHTML ?? ''
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
