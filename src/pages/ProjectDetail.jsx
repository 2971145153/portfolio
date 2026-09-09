import { Link, useParams } from 'react-router-dom'
import { projects } from '../data.js'

export default function ProjectDetail() {
  const { slug } = useParams()
  const index = projects.findIndex((project) => project.slug === slug)

  if (index === -1) {
    return (
      <main className="detail-missing container">
        <span className="eyebrow">404</span>
        <h1>这个项目不存在</h1>
        <Link className="btn btn-accent" to="/#projects">
          返回精选项目 <span aria-hidden="true">↗</span>
        </Link>
      </main>
    )
  }

  const project = projects[index]
  const next = projects[(index + 1) % projects.length]

  return (
    <main className="detail-page">
      <section className="detail-hero">
        <div className="container detail-hero-grid">
          <div className="detail-hero-copy">
            <Link className="detail-back" to="/#projects">
              <span aria-hidden="true">←</span> 返回精选项目
            </Link>
            <p className="eyebrow hero-enter">
              <span className="eyebrow-dot" />
              Selected Work · {project.id}
            </p>
            <h1 className="hero-enter">{project.title}</h1>
            <p className="detail-desc hero-enter">{project.desc}</p>
            <div className="detail-hero-meta hero-enter">
              <span>{project.category}</span>
              <span>{project.year}</span>
              <span>{project.role}</span>
            </div>
          </div>
          <figure className="detail-hero-figure hero-enter">
            <img src={project.image} alt={project.title} />
            <span className="figure-index">KEY VISUAL</span>
          </figure>
        </div>
      </section>

      <section className="detail-overview">
        <div className="container detail-overview-grid">
          <div className="detail-label reveal">
            <span>01</span>
            <p>PROJECT OVERVIEW</p>
          </div>
          <div className="detail-copy reveal">
            {project.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 12)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="detail-facts">
        <div className="container facts-grid">
          <div className="fact reveal">
            <small>类别 / CATEGORY</small>
            <p>{project.category}</p>
          </div>
          <div className="fact reveal">
            <small>年份 / YEAR</small>
            <p>{project.year}</p>
          </div>
          <div className="fact reveal">
            <small>角色 / ROLE</small>
            <p>{project.role}</p>
          </div>
          <div className="fact reveal">
            <small>工具 / TOOLS</small>
            <p>{project.tools.join(' / ')}</p>
          </div>
        </div>
      </section>

      <section className="detail-showcase">
        <div className="container">
          <div className="showcase-wide reveal">
            <img src={project.image} alt={`${project.title} 主视觉`} />
            <span>FIG. 01 — 主视觉</span>
          </div>
          <div className="showcase-pair">
            <figure className="showcase-tile reveal">
              <img src={project.image} alt={`${project.title} 细节`} />
              <figcaption>FIG. 02 — 应用细节</figcaption>
            </figure>
            <figure className="showcase-tile is-slim reveal">
              <img src={project.image} alt={`${project.title} 延展`} />
              <figcaption>FIG. 03 — 延展</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <nav className="detail-next">
        <Link to={`/projects/${next.slug}`}>
          <div className="container detail-next-inner">
            <span className="detail-next-label">NEXT PROJECT</span>
            <h2>{next.title}</h2>
            <span className="detail-next-arrow" aria-hidden="true">↗</span>
          </div>
        </Link>
      </nav>
    </main>
  )
}
