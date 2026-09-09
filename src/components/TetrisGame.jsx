import { useEffect, useRef, useState } from 'react'

const COLS = 10
const ROWS = 20
const BLOCK = 26
const COLORS = [
  '#b9f36a',
  '#57e6e6',
  '#ff3fa4',
  '#6ea8ff',
  '#ffb454',
  '#c6f6ff',
  '#f3f4f1',
]

const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
]

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

export default function TetrisGame({ open, onClose }) {
  const boardCanvas = useRef(null)
  const nextCanvas = useRef(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
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

    const canvas = boardCanvas.current
    const preview = nextCanvas.current
    const ctx = canvas.getContext('2d')
    const previewCtx = preview.getContext('2d')
    const board = emptyBoard()
    let active = null
    let nextPiece = randomPiece()
    let currentLevel = 1
    let currentLines = 0
    let over = false
    let timer = null

    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)

    function randomPiece() {
      const index = Math.floor(Math.random() * SHAPES.length)
      return {
        matrix: SHAPES[index].map((row) => [...row]),
        color: index + 1,
      }
    }

    function collides(matrix, offsetX, offsetY) {
      for (let row = 0; row < matrix.length; row += 1) {
        for (let col = 0; col < matrix[row].length; col += 1) {
          if (!matrix[row][col]) continue
          const x = offsetX + col
          const y = offsetY + row
          if (x < 0 || x >= COLS || y >= ROWS) return true
          if (y >= 0 && board[y][x]) return true
        }
      }
      return false
    }

    function drawPreview() {
      previewCtx.clearRect(0, 0, preview.width, preview.height)
      const shape = nextPiece.matrix
      const size = 22
      const offsetX = (preview.width - shape[0].length * size) / 2
      const offsetY = (preview.height - shape.length * size) / 2
      shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (!cell) return
          previewCtx.fillStyle = COLORS[nextPiece.color - 1]
          previewCtx.fillRect(
            offsetX + colIndex * size,
            offsetY + rowIndex * size,
            size - 1,
            size - 1,
          )
        })
      })
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#0d0e11'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let row = 0; row < ROWS; row += 1) {
        for (let col = 0; col < COLS; col += 1) {
          const value = board[row][col]
          if (value) {
            ctx.fillStyle = COLORS[value - 1]
            ctx.fillRect(
              col * BLOCK,
              row * BLOCK,
              BLOCK - 1,
              BLOCK - 1,
            )
          }
        }
      }

      if (active) {
        active.matrix.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            if (!cell) return
            ctx.fillStyle = COLORS[active.color - 1]
            ctx.fillRect(
              (active.x + colIndex) * BLOCK,
              (active.y + rowIndex) * BLOCK,
              BLOCK - 1,
              BLOCK - 1,
            )
          })
        })
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.035)'
      ctx.lineWidth = 1
      for (let col = 1; col < COLS; col += 1) {
        ctx.beginPath()
        ctx.moveTo(col * BLOCK, 0)
        ctx.lineTo(col * BLOCK, canvas.height)
        ctx.stroke()
      }
      for (let row = 1; row < ROWS; row += 1) {
        ctx.beginPath()
        ctx.moveTo(0, row * BLOCK)
        ctx.lineTo(canvas.width, row * BLOCK)
        ctx.stroke()
      }
      drawPreview()
    }

    function spawn() {
      active = {
        ...nextPiece,
        x: Math.floor((COLS - nextPiece.matrix[0].length) / 2),
        y: 0,
      }
      nextPiece = randomPiece()
      if (collides(active.matrix, active.x, active.y)) {
        over = true
        setGameOver(true)
        if (timer) window.clearInterval(timer)
      }
      draw()
    }

    function mergeAndClear() {
      active.matrix.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (!cell) return
          const y = active.y + rowIndex
          const x = active.x + colIndex
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            board[y][x] = active.color
          }
        })
      })

      let cleared = 0
      for (let row = ROWS - 1; row >= 0; row -= 1) {
        if (board[row].every((cell) => cell !== 0)) {
          board.splice(row, 1)
          board.unshift(Array(COLS).fill(0))
          cleared += 1
          row += 1
        }
      }

      if (cleared) {
        const gained = [0, 100, 300, 500, 800][cleared] || 800
        setScore((current) => current + gained)
        currentLines += cleared
        setLines(currentLines)
        const newLevel = Math.floor(currentLines / 8) + 1
        if (newLevel !== currentLevel) {
          currentLevel = newLevel
          setLevel(newLevel)
          resetTimer()
        }
      }
    }

    function softTick() {
      if (over) return
      if (!collides(active.matrix, active.x, active.y + 1)) {
        active.y += 1
      } else {
        mergeAndClear()
        spawn()
      }
      draw()
    }

    function hardDrop() {
      if (over) return
      while (!collides(active.matrix, active.x, active.y + 1)) {
        active.y += 1
        setScore((current) => current + 2)
      }
      mergeAndClear()
      spawn()
      draw()
    }

    function move(dx) {
      if (over) return
      if (!collides(active.matrix, active.x + dx, active.y)) {
        active.x += dx
        draw()
      }
    }

    function rotate() {
      if (over) return
      const rotated = active.matrix[0].map((_, index) =>
        active.matrix.map((row) => row[index]).reverse(),
      )
      const offsets = [0, -1, 1, -2, 2]
      for (const offset of offsets) {
        if (!collides(rotated, active.x + offset, active.y)) {
          active.matrix = rotated
          active.x += offset
          break
        }
      }
      draw()
    }

    function resetTimer() {
      if (timer) window.clearInterval(timer)
      const speed = Math.max(70, 720 - (currentLevel - 1) * 65)
      timer = window.setInterval(softTick, speed)
    }

    const onKeyDown = (event) => {
      if (!open || over) return
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) {
        event.preventDefault()
      }
      if (event.key === 'ArrowLeft') move(-1)
      if (event.key === 'ArrowRight') move(1)
      if (event.key === 'ArrowDown') softTick()
      if (event.key === 'ArrowUp') rotate()
      if (event.key === ' ') hardDrop()
    }

    window.addEventListener('keydown', onKeyDown)
    spawn()
    resetTimer()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (timer) window.clearInterval(timer)
    }
  }, [open, gameId])

  if (!open) return null

  return (
    <div className="tetris-overlay" role="dialog" aria-modal="true">
      <div className="tetris-panel">
        <header className="tetris-head">
          <span>TETRIS · 隐藏彩蛋</span>
          <button type="button" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>
        <div className="tetris-body">
          <canvas
            ref={boardCanvas}
            className="tetris-board"
            width={COLS * BLOCK}
            height={ROWS * BLOCK}
          />
          <aside className="tetris-side">
            <div className="tetris-stat">
              <span>SCORE</span>
              <b>{score}</b>
            </div>
            <div className="tetris-stat">
              <span>LINES</span>
              <b>{lines}</b>
            </div>
            <div className="tetris-stat">
              <span>LEVEL</span>
              <b>{level}</b>
            </div>
            <div className="tetris-next">
              <span>NEXT</span>
              <canvas
                ref={nextCanvas}
                width={128}
                height={128}
                aria-hidden="true"
              />
            </div>
            {gameOver && (
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
            )}
            {!gameOver && (
              <p className="tetris-controls">
                ← → 移动 · ↑ 旋转 · ↓ 加速 · 空格 直落
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
