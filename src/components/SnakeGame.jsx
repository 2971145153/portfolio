import { useEffect, useRef, useState } from 'react'

const GRID = 20
const CELL = 22

function randomFood(snake) {
  let food = { x: 0, y: 0 }
  do {
    food = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    }
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y))
  return food
}

export default function SnakeGame({ open, onClose }) {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameId, setGameId] = useState(0)

  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let snake = [
      { x: 7, y: 10 },
      { x: 6, y: 10 },
      { x: 5, y: 10 },
      { x: 4, y: 10 },
    ]
    let direction = { x: 1, y: 0 }
    let pendingDirection = null
    let food = randomFood(snake)
    let over = false
    let timer = null

    setScore(0)
    setGameOver(false)

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#0d0e11'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let x = 0; x < GRID; x += 1) {
        for (let y = 0; y < GRID; y += 1) {
          ctx.strokeStyle = 'rgba(255,255,255,0.03)'
          ctx.strokeRect(x * CELL, y * CELL, CELL, CELL)
        }
      }

      snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#b9f36a' : '#57e6e6'
        ctx.fillRect(segment.x * CELL + 1, segment.y * CELL + 1, CELL - 2, CELL - 2)
      })

      ctx.fillStyle = '#ff3fa4'
      ctx.beginPath()
      ctx.arc(
        food.x * CELL + CELL / 2,
        food.y * CELL + CELL / 2,
        CELL / 2 - 3,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }

    function tick() {
      if (over) return
      if (pendingDirection) {
        const next = pendingDirection
        pendingDirection = null
        if (!(next.x === -direction.x && next.y === -direction.y)) {
          direction = next
        }
      }

      const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y,
      }
      const hitWall = head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID
      const hitSelf = snake.some(
        (segment) => segment.x === head.x && segment.y === head.y,
      )

      if (hitWall || hitSelf) {
        over = true
        setGameOver(true)
        if (timer) window.clearInterval(timer)
        return
      }

      snake = [head, ...snake]
      if (head.x === food.x && head.y === food.y) {
        setScore((current) => current + 10)
        food = randomFood(snake)
      } else {
        snake.pop()
      }
      draw()
    }

    const onKeyDown = (event) => {
      if (!open || over) return
      const keys = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      }
      if (keys[event.key]) {
        event.preventDefault()
        pendingDirection = keys[event.key]
      }
    }

    window.addEventListener('keydown', onKeyDown)
    draw()
    timer = window.setInterval(tick, 130)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (timer) window.clearInterval(timer)
    }
  }, [open, gameId])

  if (!open) return null

  return (
    <div className="tetris-overlay" role="dialog" aria-modal="true">
      <div className="tetris-panel snake-panel">
        <header className="tetris-head">
          <span>SNAKE · 长按彩蛋</span>
          <button type="button" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>
        <div className="tetris-body snake-body">
          <canvas
            ref={canvasRef}
            className="snake-canvas"
            width={GRID * CELL}
            height={GRID * CELL}
          />
          <aside className="tetris-side">
            <div className="tetris-stat">
              <span>SCORE</span>
              <b>{score}</b>
            </div>
            <div className="tetris-stat">
              <span>LENGTH</span>
              <b>{4 + Math.floor(score / 10)}</b>
            </div>
            {gameOver ? (
              <div className="tetris-gameover">
                <span>GAME OVER</span>
                <p>最终得分 {score}</p>
                <button
                  type="button"
                  onClick={() => setGameId((current) => current + 1)}
                >
                  再来一次
                </button>
              </div>
            ) : (
              <p className="tetris-controls">方向键控制移动</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
