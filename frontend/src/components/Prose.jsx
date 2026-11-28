import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { stripOfficeMarkup } from '../utils/sanitize'
import './Prose.css'

export default function Prose({ children, className = '', style }) {
  if (!children) return null
  const text = stripOfficeMarkup(children).trim()
  const plain = text.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').trim()
  if (!text || (!plain && !/<img\b/i.test(text))) return null
  return (
    <div className={`prose ${className}`} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{text}</ReactMarkdown>
    </div>
  )
}
