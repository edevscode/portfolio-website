import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import './Prose.css'

function cleanRichText(raw) {
  return String(raw)
    // Strip Word conditional comments & HTML comments (e.g. <!--[if gte mso 9]><xml>...</xml><![endif]-->)
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Strip embedded <xml>, <style>, <script> blocks
    .replace(/<(xml|style|script)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Strip Office XML namespaced tags (e.g. <o:p>, </o:p>, <w:.../>)
    .replace(/<\/?[a-z]+:[a-z0-9_-]+[^>]*>/gi, '')
    .trim()
}

export default function Prose({ children, className = '', style }) {
  if (!children) return null
  const text = cleanRichText(children)
  const plain = text.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').trim()
  if (!text || (!plain && !/<img\b/i.test(text))) return null
  return (
    <div className={`prose ${className}`} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{text}</ReactMarkdown>
    </div>
  )
}
