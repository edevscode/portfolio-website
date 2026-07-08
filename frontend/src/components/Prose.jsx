import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import './Prose.css'

export default function Prose({ children, className = '', style }) {
  if (!children) return null
  const text = String(children)
    .replace(/<!--StartFragment-->/g, '')
    .replace(/<!--EndFragment-->/g, '')
    .trim()
  return (
    <div className={`prose ${className}`} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{text}</ReactMarkdown>
    </div>
  )
}
