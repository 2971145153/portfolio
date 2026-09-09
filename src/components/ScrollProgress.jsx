import { useEffect } from 'react'

export default function ScrollProgress() {
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const progress = doc.scrollTop / Math.max(1, doc.scrollHeight - doc.clientHeight)
      doc.style.setProperty('--scroll', String(Math.min(1, progress)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return <div className="scroll-progress" aria-hidden="true" />
}
