import { useEffect, useState } from 'react'

/**
 * Lightweight viewport scroll-reveal hook.
 * Uses a callback ref so sections that mount after async data loads are
 * observed reliably, and threshold 0 with a small bottom rootMargin so tall
 * stacked sections on small mobile viewports always reveal upon entering view.
 * Immediately reveals when prefers-reduced-motion is enabled or
 * IntersectionObserver is unavailable.
 */
export function useReveal(options = {}) {
  const { threshold = 0, rootMargin = '0px 0px -24px 0px' } = options
  const [node, setNode] = useState(null)
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true
    if (typeof IntersectionObserver === 'undefined') return true
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  })

  useEffect(() => {
    if (visible || !node) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [node, visible, threshold, rootMargin])

  return [setNode, visible]
}
