import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import './Prose.css'

function stripClipboardMarkers(str) {
  return str.replace(/<!--StartFragment-->/g, '').replace(/<!--EndFragment-->/g, '').trim()
}

export default function Prose({ children, className = '', style }) {
  if (!children) return null
  const clean = stripClipboardMarkers(String(children))
  return (
    <div className={`prose ${className}`} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{clean}</ReactMarkdown>
    </div>
  )
}
