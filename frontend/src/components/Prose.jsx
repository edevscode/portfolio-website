import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './Prose.css'

// Strip Windows clipboard HTML fragment markers that appear when pasting from browsers/Docs
function stripClipboardMarkers(str) {
  return str.replace(/<!--StartFragment-->/g, '').replace(/<!--EndFragment-->/g, '').trim()
}

export default function Prose({ children, className = '', style }) {
  if (!children) return null
  const clean = stripClipboardMarkers(String(children))
  if (/<[a-z]/i.test(clean)) {
    return (
      <div
        className={`prose ${className}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    )
  }
  return (
    <div className={`prose ${className}`} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{clean}</ReactMarkdown>
    </div>
  )
}
