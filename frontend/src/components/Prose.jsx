import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './Prose.css'

// If content starts with an HTML tag it came from the rich-text editor;
// otherwise fall back to the markdown renderer so old content still works.
const looksLikeHtml = (str) => /^\s*<[a-z]/i.test(str)

export default function Prose({ children, className = '', style }) {
  if (!children) return null
  if (looksLikeHtml(children)) {
    return (
      <div
        className={`prose ${className}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: children }}
      />
    )
  }
  return (
    <div className={`prose ${className}`} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
