import { useEffect, useRef, useState } from 'react'
import { regions } from '../data/regions.js'
const maps = { names: ['Mapa com nomes', './mapa.webp'], art: ['Mapa ilustrado', './mapa-ilustrado.jpg'] }
const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 675
const pencilColors = [
  { name: 'Laranja', value: '#ff8a2b' },
  { name: 'Branco', value: '#ffffff' },
  { name: 'Vermelho', value: '#ef3340' },
  { name: 'Amarelo', value: '#ffd43b' },
  { name: 'Verde', value: '#38d878' },
  { name: 'Azul', value: '#39a9ff' },
  { name: 'Roxo', value: '#b56bff' },
  { name: 'Rosa', value: '#ff66b3' },
]
const islandArt = {
  'Prepúcio Ártico': 'prepucio-artico',
  'Cordilheira Rachada': 'cordilheira-rachada',
  'Triatlo Infernal': 'triatlo-infernal',
  'Ruína dos Cristais': 'ruina-dos-cristais',
  'Ilha dos Segredos': 'ilha-dos-segredos',
  Camocim: 'camocim',
  'Maçã Radiativa': 'maca-radiativa',
}
const islandColors = {
  'Prepúcio Ártico': '#1f74e8',
  'Cordilheira Rachada': '#13a84c',
  'Triatlo Infernal': '#d3181c',
  'Ruína dos Cristais': '#8a2be2',
  'Ilha dos Segredos': '#0e8f46',
  Camocim: '#e8700a',
  'Maçã Radiativa': '#f0be00',
}
const islandOrigins = {
  'Prepúcio Ártico': [
    { name: 'Ártico', image: 'artico' },
    { name: 'Picos da Mixagem', image: 'picos-da-mixagem' },
  ],
  'Cordilheira Rachada': [
    { name: 'Rachada', image: 'rachada' },
    { name: 'Terras Áridas', image: 'terras-aridas' },
  ],
  'Ruína dos Cristais': [
    { name: 'Ilha Principal (Cristais)', image: 'ilha-principal' },
    { name: 'Lago dos Sábios', image: 'lago-dos-sabios' },
  ],
  'Triatlo Infernal': [
    { name: 'Vulcão Infernal', image: 'vulcao-infernal' },
    { name: 'Terras Áridas', image: 'terras-aridas' },
  ],
  Camocim: [
    { name: 'Deserto', image: 'deserto' },
    { name: 'Terras Áridas', image: 'terras-aridas' },
  ],
  'Maçã Radiativa': [
    { name: 'Maçã Verde', image: 'maca-verde' },
    { name: 'Lago dos Sábios', image: 'lago-dos-sabios' },
  ],
  'Ilha dos Segredos': [
    { name: 'Ilha Principal', image: 'ilha-principal' },
    { name: 'Ilha da Paz', image: 'ilha-da-paz' },
  ],
}
export default function MapViewer() {
  const [t, setT] = useState({ x: 0, y: 0, s: 1 })
  const [sel, setSel] = useState(regions[0])
  const [mode, setMode] = useState('names')
  const [drawTool, setDrawTool] = useState('pencil')
  const [drawColor, setDrawColor] = useState(pencilColors[0].value)
  const [strokes, setStrokes] = useState([])
  const detailDialog = useRef(null)
  const drag = useRef(null)
  const viewport = useRef(null)
  const mapImage = useRef(null)
  const canvas = useRef(null)
  const drawingPointer = useRef(null)
  const activeStroke = useRef(null)
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
      context.strokeStyle = stroke.color ?? '#ff8a2b'
      context.lineWidth = stroke.tool === 'eraser' ? 38 : 8
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.beginPath()
      context.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (let index = 1; index < stroke.points.length; index += 1) {
        const point = stroke.points[index]
        context.lineTo(point.x, point.y)
      }
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
    activeStroke.current = { tool: drawTool, color: drawColor, points: [point] }
    const context = canvas.current?.getContext('2d')
    if (!context) return
    context.globalCompositeOperation = drawTool === 'eraser' ? 'destination-out' : 'source-over'
    context.strokeStyle = drawColor
    context.lineWidth = drawTool === 'eraser' ? 38 : 8
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo(point.x, point.y)
    context.lineTo(point.x + 0.1, point.y + 0.1)
    context.stroke()
  }
  const continueDrawing = (event) => {
    event.stopPropagation()
    if (drawingPointer.current !== event.pointerId) return
    const point = drawingPoint(event)
    const stroke = activeStroke.current
    const context = canvas.current?.getContext('2d')
    if (!stroke || !context) return
    stroke.points.push(point)
    context.lineTo(point.x, point.y)
    context.stroke()
  }
  const stopDrawing = (event) => {
    event.stopPropagation()
    if (drawingPointer.current !== event.pointerId) return
    drawingPointer.current = null
    const stroke = activeStroke.current
    activeStroke.current = null
    if (stroke) setStrokes((current) => [...current, stroke])
    if (canvas.current) canvas.current.getContext('2d').globalCompositeOperation = 'source-over'
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const finishDrag = () => {
    const currentDrag = drag.current
    if (!currentDrag) return
    drag.current = null
    mapImage.current?.classList.remove('is-dragging')
    setT((current) => ({ ...current, x: currentDrag.lastX, y: currentDrag.lastY }))
  }
  return (<>
    <div className="row"><button className={`btn ${mode === 'names' ? 'primary' : ''}`} onClick={() => setMode('names')}>MAPA COM NOMES</button><button className={`btn ${mode === 'art' ? 'primary' : ''}`} onClick={() => setMode('art')}>MAPA ILUSTRADO</button></div>
    {mode === 'art' && <div className="row map-tools" role="toolbar" aria-label="Ferramentas de desenho do mapa">
      <button className={`btn ${drawTool === 'pan' ? 'primary' : ''}`} aria-pressed={drawTool === 'pan'} onClick={() => setDrawTool('pan')}>✋ MOVER</button>
      <button className={`btn ${drawTool === 'pencil' ? 'primary' : ''}`} aria-pressed={drawTool === 'pencil'} onClick={() => setDrawTool('pencil')}>✏️ LÁPIS</button>
      <div className="map-pencil-colors" role="group" aria-label="Cor do lápis">
        {pencilColors.map((color) => <button key={color.value} className={`map-pencil-color${drawColor === color.value ? ' is-selected' : ''}`} type="button" style={{ '--pencil-color': color.value }} aria-label={`Cor ${color.name}`} aria-pressed={drawColor === color.value} title={color.name} onClick={() => { setDrawColor(color.value); setDrawTool('pencil') }} />)}
      </div>
      <button className={`btn ${drawTool === 'eraser' ? 'primary' : ''}`} aria-pressed={drawTool === 'eraser'} onClick={() => setDrawTool('eraser')}>⌫ BORRACHA</button>
      <button className="btn" onClick={() => setStrokes((current) => current.slice(0, -1))} disabled={!strokes.length}>↶ DESFAZER</button>
      <button className="btn" onClick={() => setStrokes([])} disabled={!strokes.length}>🗑 LIMPAR</button>
    </div>}
    <div className={`mapbox${mode === 'art' ? ' mapbox-art' : ''}`}>
      <div className="viewport" ref={viewport}
        onWheel={(e) => zoom(e.deltaY < 0 ? 0.15 : -0.15)}
        onPointerDown={(e) => { drag.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, originX: t.x, originY: t.y, lastX: t.x, lastY: t.y }; mapImage.current?.classList.add('is-dragging') }}
        onPointerMove={(e) => {
          const start = drag.current
          if (!start || start.pointerId !== e.pointerId) return
          start.lastX = start.originX + e.clientX - start.startX
          start.lastY = start.originY + e.clientY - start.startY
          if (mapImage.current) mapImage.current.style.transform = `translate(${start.lastX}px,${start.lastY}px) scale(${t.s})`
        }}
        onPointerUp={finishDrag} onPointerCancel={finishDrag} onPointerLeave={finishDrag}>
        <div ref={mapImage} className="mapimg" style={{ transform: `translate(${t.x}px,${t.y}px) scale(${t.s})`, '--s': t.s }}>
          <img src={maps[mode][1]} alt={maps[mode][0]} draggable={false} style={{ objectFit: mode === 'art' ? 'contain' : 'fill' }} />
          {mode === 'art' && <canvas ref={canvas} className={`draw-canvas ${drawTool === 'pan' ? 'pan' : ''}`} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-label="Área para desenhar no mapa" onPointerDown={startDrawing} onPointerMove={continueDrawing} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} />}
          {mode === 'names' && regions.map((r) => (
            <button key={r.id} className={`pin ${r.special ? 'special' : ''} ${sel.id === r.id ? 'on' : ''}`} style={{ left: r.x + '%', top: r.y + '%' }}
              onPointerDown={(e) => e.stopPropagation()} onClick={() => focusRegion(r)} title={r.name}>{r.special ? '⚔' : '●'}</button>
          ))}
        </div>
        <div className="zoombtns"><button onClick={() => zoom(0.3)}>＋</button><button onClick={() => zoom(-0.3)}>－</button><button onClick={() => setT({ x: 0, y: 0, s: 1 })}>⟲</button></div>
      </div>
      {mode === 'names' && <>
      <aside className="card info world-island-preview" style={{ '--island-color': islandColors[sel.name] ?? '#5ecbff' }}>
        <img className="world-island-preview-art" src={'/roulette-islands/' + islandArt[sel.name] + '.webp'} alt="" />
        <div className="world-island-preview-copy">
          <h3>{sel.name}</h3>
          {sel.description && sel.description !== '[PLACEHOLDER]'
            ? <p>{sel.description.split(/(?<=[.!?])\s+/)[0]}</p>
            : <p className="region-info-pending">As informações desta ilha serão adicionadas em breve.</p>}
        </div>
        <button className="world-island-open" type="button" onClick={() => detailDialog.current?.showModal()}>
          ABRIR FICHA
        </button>
      </aside>

      <dialog ref={detailDialog} className="world-island-dialog" style={{ '--island-color': islandColors[sel.name] ?? '#5ecbff' }} onClick={(event) => { if (event.target === detailDialog.current) detailDialog.current.close() }}>
        <button className="world-island-close" type="button" aria-label="Fechar ficha" onClick={() => detailDialog.current?.close()}>×</button>
        <article className="world-island-card">
          <header className="world-island-card-header">
            <img src={'/roulette-islands/' + islandArt[sel.name] + '.webp'} alt={'Ilustração de ' + sel.name} />
            <div>
              <h2>{sel.name}</h2>
              {sel.description && sel.description !== '[PLACEHOLDER]'
                ? <p>{sel.description}</p>
                : <p className="region-info-pending">O texto desta ilha ainda não foi adicionado.</p>}
            </div>
          </header>
          <section className="world-island-origins" aria-label="Ilhas de origem no Minecraft Guerra 2">
            <h3>Formada pela junção de ilhas do MG2</h3>
            <div className="world-island-origin-pair">
              {(islandOrigins[sel.name] ?? []).map((origin, index) => <div className="world-island-origin-group" key={origin.image + origin.name}>
                {index > 0 && <span className="world-island-origin-plus" aria-hidden="true">+</span>}
                <figure className="world-island-origin">
                  <img src={`/mg2-islands/${origin.image}.png`} alt={`Recorte da ilha ${origin.name} no mapa MG2`} />
                  <figcaption>{origin.name}</figcaption>
                </figure>
              </div>)}
            </div>
          </section>
          <div className="world-island-card-details">
            <section>
              <h3>Recursos</h3>
              {Array.isArray(sel.resources) && sel.resources.length
                ? <ul className="world-island-chips">{sel.resources.map((resource) => <li key={resource}>{resource}</li>)}</ul>
                : <p className="region-info-pending">Em breve.</p>}
            </section>
            {sel.dangers && sel.dangers !== '[PLACEHOLDER]' && <section>
              <h3>Perigos</h3>
              {Array.isArray(sel.dangers)
                ? <div className="world-island-points">{sel.dangers.map((point) => <div className="world-island-point" key={point.title}><b>{point.title}</b><span>{point.text}</span></div>)}</div>
                : <p>{sel.dangers}</p>}
            </section>}
            <section>
              <h3>Pontos importantes</h3>
              {Array.isArray(sel.points) && sel.points.length
                ? <div className="world-island-points">{sel.points.map((point) => <div className="world-island-point" key={point.title}><b>{point.title}</b><span>{point.text}</span></div>)}</div>
                : <p className="region-info-pending">Em breve.</p>}
            </section>
          </div>
        </article>
      </dialog>
      </>}
    </div></>)
}
