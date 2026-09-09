import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SnakeGame from '../components/SnakeGame.jsx'
import TetrisGame from '../components/TetrisGame.jsx'
import {
  contact,
  profile,
  stats,
  timeline,
  projects,
  strengths,
} from '../data.js'

const marqueeItems = [
  '品牌视觉',
  '视觉概念',
  '包装设计',
  '编辑设计',
  '动态视觉',
  '字体排印',
]

function CanvasDynamics() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width = 0
    let height = 0
    let frameId = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles = []

    const seedParticles = () => {
      const count = Math.round((width * height) / 24000)
      particles = Array.from({ length: Math.min(count, 120) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        speedX: (Math.random() - 0.5) * 0.09,
        speedY: (Math.random() - 0.5) * 0.06,
        alpha: Math.random() * 0.42 + 0.14,
        warm: Math.random() > 0.78,
      }))
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seedParticles()
    }

    const draw = (now) => {
      ctx.clearRect(0, 0, width, height)

      // A slow vertical light scan crossing the hero.
      const scan = (now % 9000) / 9000
      const scanY = scan * height
      ctx.fillStyle = 'rgba(185, 243, 106, 0.09)'
      ctx.fillRect(0, scanY, width, 1)

      particles.forEach((particle) => {
        particle.x += particle.speedX
        particle.y += particle.speedY
        if (particle.x < -8) particle.x = width + 8
        if (particle.x > width + 8) particle.x = -8
        if (particle.y < -8) particle.y = height + 8
        if (particle.y > height + 8) particle.y = -8

        const color = particle.warm
          ? '185, 243, 106'
          : '210, 216, 225'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${particle.alpha})`
        ctx.fill()
      })

      frameId = requestAnimationFrame(draw)
    }

    resize()
    frameId = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas className="fx-canvas" ref={canvasRef} aria-hidden="true" />
}

function HeroBackdrop() {
  const [videoFailed, setVideoFailed] = useState(false)

  return (
    <div className="hero-backdrop" aria-hidden="true">
      <div className="fx-grid" />
      <div className="fx-aurora" />
      <div className="fx-blob fx-blob-1" />
      <div className="fx-blob fx-blob-2" />
      <div className="fx-blob fx-blob-3" />
      <CanvasDynamics />
      {!videoFailed && (
        <video
          className="hero-video"
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
        />
      )}
      <div className="fx-shade" />
    </div>
  )
}

function Hero() {
  const shardCount = 6
  const [sunClicks, setSunClicks] = useState(0)
  const [showTetris, setShowTetris] = useState(false)
  const [showSnake, setShowSnake] = useState(false)
  const [holding, setHolding] = useState(false)
  const [midHint, setMidHint] = useState(false)
  const [holdMidHint, setHoldMidHint] = useState(false)
  const holdTimer = useRef(null)
  const holdHintTimer = useRef(null)

  useEffect(() => {
    if (sunClicks !== 10) return undefined
    const timer = window.setTimeout(() => setMidHint(false), 3200)
    return () => window.clearTimeout(timer)
  }, [sunClicks])

  const handleSunClick = () => {
    if (showTetris || showSnake) return
    const next = sunClicks + 1
    if (next >= 20) {
      setSunClicks(0)
      setMidHint(false)
      setShowTetris(true)
      return
    }
    if (next === 10) {
      setMidHint(true)
    } else if (next > 10) {
      setMidHint(false)
    }
    setSunClicks(next)
  }

  const startHold = () => {
    if (showTetris || showSnake) return
    setHolding(true)
    holdHintTimer.current = window.setTimeout(() => {
      setHoldMidHint(true)
      window.setTimeout(() => setHoldMidHint(false), 3000)
    }, 5000)
    holdTimer.current = window.setTimeout(() => {
      setHolding(false)
      setHoldMidHint(false)
      setSunClicks(0)
      setShowSnake(true)
    }, 10000)
  }

  const stopHold = () => {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    if (holdHintTimer.current) {
      window.clearTimeout(holdHintTimer.current)
      holdHintTimer.current = null
    }
    setHolding(false)
    setHoldMidHint(false)
  }

  return (
    <section className="hero" id="top">
      <HeroBackdrop />
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow hero-enter">
            <span className="eyebrow-dot" />
            Visual & Brand Designer
          </p>
          <h1>
            <span className="hero-line">
              <span className="hero-line-inner">做有力量的视觉，</span>
            </span>
            <span className="hero-line">
              <span className="hero-line-inner">
                <em className="glitch-text">
                  让品牌被记住。
                </em>
              </span>
            </span>
          </h1>
          <p className="hero-sub hero-enter">
            把品牌策略与视觉系统放在一起，做出克制、清晰、且有未来感的作品。
          </p>
          <div className="hero-actions hero-enter">
            <Link className="btn btn-accent" to="/#projects">
              查看精选项目 <span aria-hidden="true">↗</span>
            </Link>
            <Link className="btn btn-ghost" to="/#about">
              了解我的经历
            </Link>
          </div>
        </div>
        <div className="hero-side">
          <div className="hero-rail-top">
            <span className="hero-rail-index">01</span>
            <span className="hero-rail-label">Portfolio · 2026</span>
          </div>
          <div className="hero-sign">
            <span
              className="hero-sign-figure"
              role="button"
              tabIndex={0}
              aria-label="点击「孙」二十次解锁俄罗斯方块，长按十秒解锁贪吃蛇"
              onClick={handleSunClick}
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleSunClick()
                }
              }}
            >
              <span className="hero-sign-char">孙</span>
              <span className="hero-shards">
                {Array.from({ length: shardCount }, (_, index) => (
                  <span
                    className="hero-shard"
                    key={index}
                    style={{ '--shard-index': index }}
                  >
                  孙
                  </span>
                ))}
              </span>
            </span>
            <div className="hero-sign-copy">
              <b>
                <span className="copy-base">Visual &amp; Brand Designer</span>
                {holding && (
                  <span className="copy-charge" aria-hidden="true">
                    Visual &amp; Brand Designer
                  </span>
                )}
              </b>
            </div>
          </div>
          <div className="hero-rail-meta">
            <span>Hangzhou · CN</span>
            <span>Est. 2002</span>
          </div>
          <Link className="hero-scroll" to="/#about">
            SCROLL <span aria-hidden="true">↓</span>
          </Link>
        </div>
      </div>
      {(holdMidHint || (sunClicks === 10 && midHint)) && (
        <div className="egg-toast is-show">
          {holdMidHint
            ? '按够了没？'
            : '不要点啦，再点 10 次解锁俄罗斯方块'}
        </div>
      )}
      <TetrisGame open={showTetris} onClose={() => setShowTetris(false)} />
      <SnakeGame open={showSnake} onClose={() => setShowSnake(false)} />
    </section>
  )
}

function Marquee({ items }) {
  const doubled = [...items, ...items]

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((item, index) => (
          <span className="marquee-item" key={`${item}-${index}`}>
            {item}
            <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  )
}

function SectionHead({ index, title, note }) {
  return (
    <header className="section-head reveal">
      <span className="section-index">{index}</span>
      <h2>{title}</h2>
      <span className="section-note">{note}</span>
    </header>
  )
}

function About() {
  return (
    <section className="about section" id="about">
      <div className="container">
        <SectionHead index="02" title="个人经历" note="EXPERIENCE" />
        <div className="about-grid">
          <figure className="about-figure reveal">
            <div className="figure-frame">
              <img src={profile.avatar} alt={`${profile.name} 头像`} />
              <span className="figure-index">P</span>
            </div>
            <figcaption>
              <span>PORTRAIT</span>
              <span>{profile.location}</span>
            </figcaption>
          </figure>

          <div className="about-copy reveal">
            <p className="overline">你好，我是</p>
            <h3>{profile.name}</h3>
            <p className="about-role">{profile.role}</p>
            <p className="about-intro">{profile.intro}</p>
            <div className="about-contact">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <span>{profile.location}</span>
            </div>
            <div className="stats">
              {stats.map((item) => (
                <div className="stat" key={item.label}>
                  <b>{item.value}</b>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="timeline">
          {timeline.map((item) => (
            <article className="timeline-item reveal" key={item.year + item.role}>
              <time>{item.year}</time>
              <div className="timeline-dot" />
              <div className="timeline-body">
                <span className="timeline-org">{item.org}</span>
                <h4>{item.role}</h4>
                <p>{item.desc}</p>
                <div className="timeline-extra">
                  {item.detail.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Projects() {
  return (
    <section className="projects section" id="projects">
      <div className="container">
        <SectionHead index="03" title="精选项目" note="SELECTED WORKS" />
        <div className="project-features">
          {projects.map((project, index) => (
            <Link
              className={`project-feature ${index % 2 === 1 ? 'is-even' : ''}`}
              to={`/projects/${project.slug}`}
              key={project.id}
            >
              <span className="feature-ghost" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="feature-media">
                <img src={project.image} alt={project.title} loading="lazy" />
                <span className="feature-hint">VIEW CASE ↗</span>
              </div>
              <div className="feature-info">
                <p className="project-meta">
                  {project.category} · {project.year}
                </p>
                <h3>{project.title}</h3>
                <p className="project-desc">{project.desc}</p>
                <span className="feature-extra">
                  {project.role} · {project.tools.join(' / ')}
                </span>
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <span className="feature-cta">
                  查看完整案例 <span aria-hidden="true">↗</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function Strengths() {
  return (
    <section className="strengths section" id="strengths">
      <div className="container">
        <SectionHead index="04" title="个人优势" note="CAPABILITIES" />
        <div className="strength-grid">
          {strengths.map((item, index) => (
            <article className="strength-card reveal" key={item.title}>
              <span className="strength-icon">{item.icon}</span>
              <span className="strength-num">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <div className="strength-extra">
                {item.detail.map((keyword) => (
                  <span key={keyword}>{keyword}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactCard({ label, value, isEmail = false }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        const helper = document.createElement('textarea')
        helper.value = value
        helper.style.position = 'fixed'
        helper.style.opacity = '0'
        document.body.appendChild(helper)
        helper.select()
        document.execCommand('copy')
        helper.remove()
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    }
  }

  const sendEmail = async () => {
    await copy()
    window.setTimeout(() => {
      window.location.href = `mailto:${value}`
    }, 150)
  }

  return (
    <article className={`contact-card reveal ${isEmail ? 'is-email' : ''}`}>
      <header className="contact-card-head">
        <span className="contact-card-label">{label}</span>
        <span className="contact-card-icon" aria-hidden="true">
          {isEmail ? (
            <svg
              className="contact-card-icon-mail"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="1" />
              <path d="m3 7 9 6.5L21 7" />
            </svg>
          ) : (
            '◍'
          )}
        </span>
      </header>
      {isEmail ? (
        <a className="contact-card-value" href={`mailto:${value}`}>
          {value}
        </a>
      ) : (
        <span className="contact-card-value">{value}</span>
      )}
      <div className="contact-card-action">
        {isEmail ? (
          <button type="button" onClick={sendEmail}>
            {copied ? '邮箱已复制 ✓' : '发送邮件'}
          </button>
        ) : (
          <button type="button" onClick={copy}>
            {copied ? '已复制 ✓' : '复制'}
          </button>
        )}
      </div>
    </article>
  )
}

function Contact() {
  return (
    <footer className="contact" id="contact">
      <div className="container contact-inner">
        <p className="eyebrow reveal">
          <span className="eyebrow-dot" />
          Contact / 联系方式
        </p>
        <div className="contact-cards">
          <ContactCard label="EMAIL / 邮箱" value={contact.email} isEmail />
          <ContactCard label="WECHAT / 微信" value={contact.wechat} />
          <ContactCard label="QQ" value={contact.qq} />
        </div>
      </div>
      <div className="contact-bottom">
        <span>
          © 2026 <b className="footer-name">{profile.name}</b> · {profile.role} · {profile.location}
        </span>
        <span>DESIGN IS A CONVERSATION.</span>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Marquee items={marqueeItems} />
        <About />
        <Projects />
        <Strengths />
      </main>
      <Contact />
    </>
  )
}
