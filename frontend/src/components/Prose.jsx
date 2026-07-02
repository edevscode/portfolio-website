import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './Prose.css'

export default function Prose({ children, className = '', style }) {
  if (!children) return null
  return (
    <div className={`prose ${className}`} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
