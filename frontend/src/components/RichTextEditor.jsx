import React, { useRef, useEffect, useCallback } from 'react'
import './RichTextEditor.css'

// ── Strip Word/Docs cruft but keep semantic tags ──────────────────────────────
function cleanPastedHtml(html) {
  const wrap = document.createElement('div')
  wrap.innerHTML = html
  wrap.querySelectorAll('script,style,link,meta,iframe,object,embed').forEach(el => el.remove())
  wrap.querySelectorAll('*').forEach(el => {
    const tag = el.tagName.toLowerCase()
    const href = el.getAttribute('href')
    Array.from(el.attributes).forEach(attr => el.removeAttribute(attr.name))
    if (tag === 'a' && href) el.setAttribute('href', href)
  })
  return wrap.innerHTML
}

const TOOLS = [
  { cmd: 'bold',                icon: 'B',       title: 'Bold',           cls: 'bold'  },
  { cmd: 'italic',              icon: 'I',       title: 'Italic',         cls: 'ital'  },
  { cmd: 'underline',           icon: 'U',       title: 'Underline',      cls: 'under' },
  { cmd: 'strikeThrough',       icon: 'S',       title: 'Strikethrough',  cls: 'strk'  },
  { sep: true },
  { cmd: 'formatBlock', val: 'h2', icon: 'H2',  title: 'Heading 2' },
  { cmd: 'formatBlock', val: 'h3', icon: 'H3',  title: 'Heading 3' },
  { sep: true },
  { cmd: 'insertUnorderedList', icon: '• List',  title: 'Bullet list' },
  { cmd: 'insertOrderedList',   icon: '1. List', title: 'Numbered list' },
  { cmd: 'formatBlock', val: 'blockquote', icon: '❝', title: 'Blockquote' },
  { sep: true },
  { cmd: 'removeFormat',        icon: 'Tx',      title: 'Clear formatting' },
]

export default function RichTextEditor({ value = '', onChange, placeholder, minHeight = 130 }) {
  const ref = useRef(null)
  const lastEmit = useRef(value)

  // Sync external value changes (e.g. opening a different record) without clobbering the cursor
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (value !== lastEmit.current && el.innerHTML !== value) {
      el.innerHTML = value
      lastEmit.current = value
    }
  }, [value])

  const emit = useCallback(() => {
    const html = ref.current?.innerHTML ?? ''
    lastEmit.current = html
    onChange({ target: { value: html } })
  }, [onChange])

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const html = e.clipboardData.getData('text/html')
    const text = e.clipboardData.getData('text/plain')
    if (html) {
      document.execCommand('insertHTML', false, cleanPastedHtml(html))
    } else if (text) {
      const lines = text.split('\n').map(l => l.trim() ? `<p>${l}</p>` : '<br>').join('')
      document.execCommand('insertHTML', false, lines)
    }
    emit()
  }, [emit])

  const fire = useCallback((tool) => {
    ref.current?.focus()
    document.execCommand(tool.cmd, false, tool.val ?? null)
    emit()
  }, [emit])

  return (
    <div className="rte">
      <div className="rte-bar">
        {TOOLS.map((t, i) =>
          t.sep ? (
            <span key={i} className="rte-sep" />
          ) : (
            <button
              key={i}
              type="button"
              title={t.title}
              className={`rte-btn${t.cls ? ` rte-${t.cls}` : ''}`}
              onMouseDown={(e) => { e.preventDefault(); fire(t) }}
            >
              {t.icon}
            </button>
          )
        )}
      </div>
      <div
        ref={ref}
        className="rte-body"
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onPaste={handlePaste}
        style={{ minHeight }}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={undefined}
      />
    </div>
  )
}
