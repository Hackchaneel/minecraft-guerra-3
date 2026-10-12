import { useEffect, useRef } from 'react'
// Parallax guiado pelo mouse: as imagens aparecem com "blur fade" e se movem em profundidades diferentes.
// Mesmas props do componente "Parallax Hero Images" do Aceternity UI (versão sem Tailwind/Motion):
//   images (até 8) · className · imageClassName · variant: 'default' (meio mais perto) | 'edge-focus' (pontas mais perto)
const MAX = 8
export default function ParallaxHeroImages({ images = [], className = '', imageClassName = '', variant = 'default' }) {
  const ref = useRef(null)
  const frame = useRef(null)
  const pointer = useRef({ x: 0, y: 0 })
  const list = images.slice(0, MAX)
  const n = list.length
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('phi-in'); io.disconnect() } }, { threshold: 0.15 })
    io.observe(el)
    return () => {
      io.disconnect()
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [])
  const setPointer = (x, y) => { ref.current?.style.setProperty('--mx', x); ref.current?.style.setProperty('--my', y) }
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    pointer.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2
    pointer.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => {
      setPointer(pointer.current.x, pointer.current.y)
      frame.current = null
    })
  }
  const onLeave = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    pointer.current = { x: 0, y: 0 }
    setPointer(0, 0)
  }
  const mid = (n - 1) / 2
  return (
    <div ref={ref} className={`phi ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden>
      {list.map((src, i) => {
        const dist = mid ? Math.abs(i - mid) / mid : 0
        const closeness = variant === 'edge-focus' ? dist : 1 - dist
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2
        return (
          <img key={src + i} src={src} alt="" draggable={false} loading="lazy"
            className={`phi-img ${imageClassName}`}
            style={{ left: `${50 + 35 * Math.cos(angle)}%`, top: `${50 + 31 * Math.sin(angle)}%`, '--d': 10 + closeness * 40, '--sc': 0.85 + closeness * 0.3, '--delay': `${i * 0.12}s` }} />
        )
      })}
    </div>
  )
}
