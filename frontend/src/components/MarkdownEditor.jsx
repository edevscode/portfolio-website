import React, { useState, useRef } from 'react'
import Prose from './Prose'
import './MarkdownEditor.css'

// ── Text transformation helpers ───────────────────────────────────────────────

function applyWrap(value, start, end, syntax) {
  const selected = value.slice(start, end)
  const before = value.slice(0, start)
  const after = value.slice(end)
  const s = syntax.length
  if (selected.startsWith(syntax) && selected.endsWith(syntax) && selected.length > s * 2) {
    const inner = selected.slice(s, selected.length - s)
    return { v: before + inner + after, s: start, e: start + inner.length }
  }
  const text = selected || 'text'
  return {
    v: before + syntax + text + syntax + after,
    s: start + s,
    e: start + s + text.length,
  }
}

function applyLine(value, start, prefix) {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const lineEnd = value.indexOf('\n', start)
  const line = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd)
  const before = value.slice(0, lineStart)
  const after = lineEnd === -1 ? '' : value.slice(lineEnd)
  if (line.startsWith(prefix)) {
    const trimmed = line.slice(prefix.length)
    return { v: before + trimmed + after, s: Math.max(lineStart, start - prefix.length) }
  }
  return { v: before + prefix + line + after, s: start + prefix.length }
}

const TABLE_TEMPLATE = `\n| Header | Header | Header |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n`

const TOOLS = [
  { id: 'b',   icon: 'B',       title: 'Bold',          action: (v,s,e) => applyWrap(v, s, e, '**') },
  { id: 'i',   icon: 'I',       title: 'Italic',        action: (v,s,e) => applyWrap(v, s, e, '*'), italic: true },
  { id: 's',   icon: 'S',       title: 'Strikethrough', action: (v,s,e) => applyWrap(v, s, e, '~~'), strike: true },
  { sep: true },
  { id: 'h2',  icon: 'H2',      title: 'Heading 2',     action: (v,s)   => applyLine(v, s, '## ') },
  { id: 'h3',  icon: 'H3',      title: 'Heading 3',     action: (v,s)   => applyLine(v, s, '### ') },
  { sep: true },
  { id: 'ul',  icon: '• List',  title: 'Bullet list',   action: (v,s)   => applyLine(v, s, '- ') },
  { id: 'ol',  icon: '1. List', title: 'Numbered list', action: (v,s)   => applyLine(v, s, '1. ') },
  { id: 'bq',  icon: '❝ Quote', title: 'Blockquote',    action: (v,s)   => applyLine(v, s, '> ') },
  { sep: true },
  { id: 'code',icon: '`Code`',  title: 'Inline code',   action: (v,s,e) => applyWrap(v, s, e, '`') },
  {
    id: 'tbl', icon: 'Table', title: 'Insert table',
    action: (v, _s, e) => ({ v: v.slice(0, e) + TABLE_TEMPLATE + v.slice(e), s: e + 1 }),
  },
  {
    id: 'hr',  icon: '—',    title: 'Horizontal rule',
    action: (v, _s, e) => ({ v: v.slice(0, e) + '\n\n---\n\n' + v.slice(e), s: e + 6 }),
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function MarkdownEditor({ value = '', onChange, placeholder, rows = 6 }) {
  const [tab, setTab] = useState('write')
  const ref = useRef(null)

  const fire = (tool) => {
    const ta = ref.current
    if (!ta) return
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const result = tool.action(value, s, e)
    if (!result) return
    const newValue = result.v
    const newCaret = result.e ?? result.s
    onChange({ target: { value: newValue } })
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(result.s, newCaret)
    })
  }

  return (
    <div className="mde">
      <div className="mde-bar">
        <div className="mde-tools">
          {TOOLS.map((t, i) =>
            t.sep ? (
              <span key={i} className="mde-sep" />
            ) : (
              <button
                key={t.id}
                type="button"
                title={t.title}
                className={`mde-btn${t.italic ? ' mde-btn--italic' : ''}${t.strike ? ' mde-btn--strike' : ''}`}
                onMouseDown={(ev) => { ev.preventDefault(); fire(t) }}
              >
                {t.icon}
              </button>
            )
          )}
        </div>
        <div className="mde-tabs">
          <button type="button" className={`mde-tab${tab === 'write' ? ' active' : ''}`} onClick={() => setTab('write')}>Write</button>
          <button type="button" className={`mde-tab${tab === 'preview' ? ' active' : ''}`} onClick={() => setTab('preview')}>Preview</button>
        </div>
      </div>

      {tab === 'write' ? (
        <textarea
          ref={ref}
          className="mde-area"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <div className="mde-preview">
          {value
            ? <Prose>{value}</Prose>
            : <span className="mde-preview-empty">Nothing to preview yet.</span>}
        </div>
      )}
    </div>
  )
}
