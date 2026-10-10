import { useEffect, useRef, useState } from 'react'
import { regions } from '../data/regions.js'
const maps = { names: ['Mapa com nomes', './mapa.webp'], art: ['Mapa ilustrado', './mapa-ilustrado.jpg'] }
const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 675
export default function MapViewer() {
  const [t, setT] = useState({ x: 0, y: 0, s: 1 })
  const [sel, setSel] = useState(regions[0])
  const [mode, setMode] = useState('names')
  const [drawTool, setDrawTool] = useState('pencil')
  const [strokes, setStrokes] = useState([])
  const drag = useRef(null)
  const viewport = useRef(null)
  const canvas = useRef(null)
  const drawingPointer = useRef(null)
  const zoom = (d) => setT((p) => ({ ...p, s: Math.min(4, Math.max(0.6, p.s + d)) }))
  const focusRegion = (region) => {
    setSel(region)
    drag.current = null
    const bounds = viewport.current?.getBoundingClientRect()
    if (!bounds) return
    const scale = 2.4
    setT({
      x: (0.5 - region.x / 100) * bounds.width * scale,
      y: (0.5 - region.y / 100) * bounds.height * scale,
      s: scale,
    })
  }
  useEffect(() => {
    if (mode !== 'art' || !canvas.current) return
    const context = canvas.current.getContext('2d')
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    for (const stroke of strokes) {
      if (!stroke.points.length) continue
      context.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
      context.strokeStyle = '#ff8a2b'
      context.lineWidth = stroke.tool === 'eraser' ? 38 : 8
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.beginPath()
      context.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (const point of stroke.points.slice(1)) context.lineTo(point.x, point.y)
      if (stroke.points.length === 1) context.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y + 0.1)
      context.stroke()
    }
    context.globalCompositeOperation = 'source-over'
  }, [mode, strokes])
  const drawingPoint = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * CANVAS_WIDTH,
      y: ((event.clientY - bounds.top) / bounds.height) * CANVAS_HEIGHT,
    }
  }
  const startDrawing = (event) => {
    if (drawTool === 'pan') return
    event.preventDefault()
    event.stopPropagation()
    drawingPointer.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = drawingPoint(event)
    setStrokes((current) => [...current, { tool: drawTool, points: [point] }])
  }
  const continueDrawing = (event) => {
    if (drawTool === 'pan') return
    event.stopPropagation()
    if (drawingPointer.current !== event.pointerId) return
    const point = drawingPoint(event)
    setStrokes((current) => {
      if (!current.length) return current
      const next = [...current]
      const lastIndex = next.length - 1
      const last = next[lastIndex]
      next[lastIndex] = { ...last, points: [...last.points, point] }
      return next
    })
  }
  const stopDrawing = (event) => {
    if (drawTool === 'pan') return
    event.stopPropagation()
    if (drawingPointer.current !== event.pointerId) return
    drawingPointer.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  return (<>
    <div className="row"><button className={`btn ${mode === 'names' ? 'primary' : ''}`} onClick={() => setMode('names')}>MAPA COM NOMES</button><button className={`btn ${mode === 'art' ? 'primary' : ''}`} onClick={() => setMode('art')}>MAPA ILUSTRADO</button></div>
    {mode === 'art' && <div className="row map-tools" role="toolbar" aria-label="Ferramentas de desenho do mapa">
      <button className={`btn ${drawTool === 'pan' ? 'primary' : ''}`} aria-pressed={drawTool === 'pan'} onClick={() => setDrawTool('pan')}>✋ MOVER</button>
      <button className={`btn ${drawTool === 'pencil' ? 'primary' : ''}`} aria-pressed={drawTool === 'pencil'} onClick={() => setDrawTool('pencil')}>✏️ LÁPIS</button>
      <button className={`btn ${drawTool === 'eraser' ? 'primary' : ''}`} aria-pressed={drawTool === 'eraser'} onClick={() => setDrawTool('eraser')}>⌫ BORRACHA</button>
      <button className="btn" onClick={() => setStrokes((current) => current.slice(0, -1))} disabled={!strokes.length}>↶ DESFAZER</button>
      <button className="btn" onClick={() => setStrokes([])} disabled={!strokes.length}>🗑 LIMPAR</button>
    </div>}
    <div className="mapbox">
      <div className="viewport" ref={viewport}
        onWheel={(e) => zoom(e.deltaY < 0 ? 0.15 : -0.15)}
        onPointerDown={(e) => { drag.current = { x: e.clientX - t.x, y: e.clientY - t.y } }}
        onPointerMove={(e) => {
          const start = drag.current
          if (!start) return
          const x = e.clientX - start.x
          const y = e.clientY - start.y
          setT((p) => ({ ...p, x, y }))
        }}
        onPointerUp={() => (drag.current = null)} onPointerLeave={() => (drag.current = null)}>
        <div className="mapimg" style={{ transform: `translate(${t.x}px,${t.y}px) scale(${t.s})`, '--s': t.s }}>
          <img src={maps[mode][1]} alt={maps[mode][0]} draggable={false} style={{ objectFit: mode === 'art' ? 'contain' : 'fill' }} />
          {mode === 'art' && <canvas ref={canvas} className={`draw-canvas ${drawTool === 'pan' ? 'pan' : ''}`} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-label="Área para desenhar no mapa" onPointerDown={startDrawing} onPointerMove={continueDrawing} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} />}
          {mode === 'names' && regions.map((r) => (
            <button key={r.id} className={`pin ${r.special ? 'special' : ''} ${sel.id === r.id ? 'on' : ''}`} style={{ left: r.x + '%', top: r.y + '%' }}
              onPointerDown={(e) => e.stopPropagation()} onClick={() => focusRegion(r)} title={r.name}>{r.special ? '⚔' : '●'}</button>
          ))}
        </div>
        <div className="zoombtns"><button onClick={() => zoom(0.3)}>＋</button><button onClick={() => zoom(-0.3)}>－</button><button onClick={() => setT({ x: 0, y: 0, s: 1 })}>⟲</button></div>
      </div>
      <aside className="card info">
        <h3>{sel.name}</h3>
        {[['Descrição', sel.description], ['Recursos', sel.resources], ['Perigos', sel.dangers], ['Pontos importantes', sel.points]].map(([k, v]) => (<p key={k}><b>{k}:</b> {v}</p>))}
      </aside>
    </div></>)
}
