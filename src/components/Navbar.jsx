import { useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import mg3Logo from '../assets/logo-minecraft-guerra-3-gelo.png'

const links = [
  ['/', 'INÍCIO', '⌂'],
  ['/mundo', 'MUNDO', '◉'],
  ['/historia', 'HISTÓRIA', '▤'],
  ['/como-funciona', 'COMO FUNCIONA', '✦'],
  ['/regras', 'REGRAS', '⚑'],
  ['/roleta', 'ROLETA', '◌'],
  ['/colaboradores', 'COLABORADORES', '♟'],
  ['/segredos', 'SEGREDOS', '✧'],
]

const preloadPage = {
  '/mundo': () => import('../pages/World.jsx'),
  '/historia': () => import('../pages/Story.jsx'),
  '/como-funciona': () => import('../pages/How.jsx'),
  '/regras': () => import('../pages/Rules.jsx'),
  '/roleta': () => import('../pages/RoulettePage.jsx'),
  '/colaboradores': () => import('../pages/Team.jsx'),
  '/admin': () => import('../pages/AdminLogin.jsx'),
  '/segredos': () => import('../pages/Secrets.jsx'),
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const dock = useRef(null)
  const centers = useRef([])
  const pointerX = useRef(0)
  const frame = useRef(null)

  const measureDock = () => {
    const node = dock.current
    if (!node) return
    const left = node.getBoundingClientRect().left
    centers.current = Array.from(node.children, (entry) => left + entry.offsetLeft + entry.offsetWidth / 2)
  }

  const magnify = (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return
    pointerX.current = event.clientX
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => {
      const entries = dock.current?.querySelectorAll('.nav-dock-item') ?? []
      const updates = Array.from(entries, (entry, index) => {
        const intensity = Math.max(0, 1 - Math.abs(pointerX.current - (centers.current[index] ?? 0)) / 112)
        return [entry, String(1 + intensity * .35), `${-intensity * 7}px`]
      })
      updates.forEach(([entry, scale, lift]) => {
        entry.style.setProperty('--dock-scale', scale)
        entry.style.setProperty('--dock-lift', lift)
      })
      frame.current = null
    })
  }

  const resetMagnification = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    centers.current = []
    dock.current?.querySelectorAll('.nav-dock-item').forEach((entry) => {
      entry.style.setProperty('--dock-scale', '1')
      entry.style.setProperty('--dock-lift', '0px')
    })
  }

  return (
    <header className="nav">
      <NavLink to="/" className="brand" aria-label="Minecraft Guerra 3 — início"><img src={mg3Logo} alt="Minecraft Guerra 3" /></NavLink>
      <button className="burger" type="button" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? '✕' : '☰'}</button>
      <nav ref={dock} aria-label="Navegação principal" className={`nav-dock ${open ? 'open' : ''}`} onPointerEnter={measureDock} onPointerMove={magnify} onPointerLeave={resetMagnification}>
        {links.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'} className="nav-dock-item" aria-label={label} title={label} onMouseEnter={() => preloadPage[to]?.()} onFocus={() => preloadPage[to]?.()} onClick={() => setOpen(false)}>
            <span className="nav-dock-icon" aria-hidden="true">{icon}</span>
            <span className="nav-dock-label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

