import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './Prose.css'

// Strip Windows clipboard HTML fragment markers that appear when pasting from browsers/Docs
function stripClipboardMarkers(str) {
  return str.replace(/<!--StartFragment-->/g, '').replace(/<!--EndFragment-->/g, '').trim()
}

// Detect HTML by looking for common block/inline tags (not just any `<`)
const HTML_TAG = /<(p|ul|ol|li|h[1-6]|div|span|br|hr|table|thead|tbody|tr|td|th|blockquote|strong|em|b|i|u|s|a|code|pre)\b/i

export default function Prose({ children, className = '', style }) {
  if (!children) return null
  const clean = stripClipboardMarkers(String(children))
  if (HTML_TAG.test(clean)) {
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
