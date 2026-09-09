import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { profile } from '../data.js'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <Link className="brand" to="/">
        <span className="brand-mark">◍</span>
        <span className="brand-name">{profile.name}</span>
      </Link>
      <nav className="nav-links" aria-label="主导航">
        <Link to="/#about">关于</Link>
        <Link to="/#projects">项目</Link>
        <Link to="/#strengths">优势</Link>
      </nav>
      <Link className="nav-cta" to="/#contact">
        联系我 <span aria-hidden="true">↗</span>
      </Link>
    </header>
  )
}
