import { useEffect, useRef } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import Header from './components/Header.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Home from './pages/Home.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  const firstLoad = useRef(true)

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual'
      }
      window.scrollTo(0, 0)
      if (window.location.hash) {
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search,
        )
      }
      return
    }

    if (hash) {
      const id = hash.slice(1)
      requestAnimationFrame(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          window.scrollTo(0, 0)
        }
      })
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

function RevealObserver() {
  const { pathname } = useLocation()

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [pathname])

  return null
}

function MouseParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let frameId = 0
    const particles = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = (x, y, count) => {
      for (let index = 0; index < count; index += 1) {
        if (particles.length > 70) particles.shift()
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 0.45 + 0.08
        particles.push({
          x: x + (Math.random() - 0.5) * 4,
          y: y + (Math.random() - 0.5) * 4,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.14,
          size: Math.random() * 1.5 + 0.8,
          life: 1,
          decay: 0.005 + Math.random() * 0.007,
          color: '230, 234, 240',
        })
      }
    }

    const onPointerMove = (event) => {
      const distance = Math.hypot(event.movementX, event.movementY)
      if (distance > 8 && Math.random() < 0.5) {
        spawn(event.clientX, event.clientY, 1)
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index]
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.003
        particle.vx *= 0.985
        particle.vy *= 0.985
        particle.life -= particle.decay

        if (particle.life <= 0) {
          particles.splice(index, 1)
          continue
        }

        ctx.globalAlpha = Math.max(0, particle.life) * 0.72
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${particle.color}, 1)`
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      frameId = requestAnimationFrame(draw)
    }

    resize()
    frameId = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [])

  return <canvas className="mouse-particles" ref={canvasRef} aria-hidden="true" />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <RevealObserver />
      <ScrollProgress />
      <MouseParticles />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
