import { useRef, useEffect, useCallback, useState } from 'react'
import './DrawCanvas.css'

export type Stroke = { points: { x: number; y: number }[]; color: string; width: number }

type Props = {
  strokes: Stroke[]
  onStrokesChange: (strokes: Stroke[]) => void
  disabled?: boolean
  width?: number
  height?: number
}

const COLORS = ['#1a1a2e', '#e94560', '#0f3460', '#16213e', '#533483', '#2ec4b6', '#ff9f1c', '#e71d36']
const BRUSH_SIZES = [2, 4, 8, 12, 20]

export default function DrawCanvas({ strokes, onStrokesChange, disabled, width = 600, height = 400 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState(COLORS[0])
  const [brushSize, setBrushSize] = useState(8)
  const isDrawingRef = useRef(false)
  const currentStrokeRef = useRef<Stroke | null>(null)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#faf8f5'
    ctx.fillRect(0, 0, width, height)
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      }
      ctx.stroke()
    })
  }, [strokes, width, height])

  useEffect(() => {
    redraw()
  }, [redraw])

  const getCoords = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      const scaleX = width / rect.width
      const scaleY = height / rect.height
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY : e.clientY
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
    },
    [width, height]
  )

  const startDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return
      e.preventDefault()
      const { x, y } = getCoords(e)
      isDrawingRef.current = true
      currentStrokeRef.current = { points: [{ x, y }], color, width: brushSize }
    },
    [disabled, getCoords, color, brushSize]
  )

  const moveDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawingRef.current || !currentStrokeRef.current || disabled) return
      e.preventDefault()
      const { x, y } = getCoords(e)
      currentStrokeRef.current.points.push({ x, y })
      redraw()
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) {
        const s = currentStrokeRef.current
        ctx.strokeStyle = s.color
        ctx.lineWidth = s.width
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        const pts = s.points
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y)
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
        ctx.stroke()
      }
    },
    [getCoords, redraw, disabled]
  )

  const endDraw = useCallback(() => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return
    const stroke = currentStrokeRef.current
    if (stroke.points.length >= 2) {
      onStrokesChange([...strokes, stroke])
    }
    isDrawingRef.current = false
    currentStrokeRef.current = null
  }, [strokes, onStrokesChange])

  const clear = useCallback(() => {
    if (disabled) return
    onStrokesChange([])
  }, [disabled, onStrokesChange])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onEnd = () => endDraw()
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchend', onEnd)
    }
  }, [endDraw])

  return (
    <div className="draw-canvas-wrap">
      <div className="draw-toolbar">
        <div className="draw-colors">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`draw-color-btn ${color === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              disabled={disabled}
              aria-label={`颜色 ${c}`}
            />
          ))}
        </div>
        <div className="draw-sizes">
          {BRUSH_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className={`draw-size-btn ${brushSize === s ? 'active' : ''}`}
              onClick={() => setBrushSize(s)}
              disabled={disabled}
              aria-label={`笔刷 ${s}px`}
            >
              <span style={{ width: s, height: s }} />
            </button>
          ))}
        </div>
        <button type="button" className="draw-clear" onClick={clear} disabled={disabled}>
          清空
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`draw-canvas ${disabled ? 'disabled' : ''}`}
        onMouseDown={startDraw}
        onMouseMove={moveDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={moveDraw}
      />
    </div>
  )
}
