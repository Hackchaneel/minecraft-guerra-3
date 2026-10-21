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

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const dock = useRef(null)

  const magnify = (event) => {
    const entries = dock.current?.querySelectorAll('.nav-dock-item') ?? []
    entries.forEach((entry) => {
      const bounds = entry.getBoundingClientRect()
      const distance = Math.abs(event.clientX - (bounds.left + bounds.width / 2))
      const intensity = Math.max(0, 1 - distance / 112)
      entry.style.setProperty('--dock-scale', String(1 + intensity * 0.35))
      entry.style.setProperty('--dock-lift', `${-intensity * 7}px`)
    })
  }
  const resetMagnification = () => {
    dock.current?.querySelectorAll('.nav-dock-item').forEach((entry) => {
      entry.style.setProperty('--dock-scale', '1')
      entry.style.setProperty('--dock-lift', '0px')
    })
  }

  return (
    <header className="nav">
      <NavLink to="/" className="brand" aria-label="Minecraft Guerra 3 — início"><img src={mg3Logo} alt="Minecraft Guerra 3" /></NavLink>
      <button className="burger" type="button" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? '✕' : '☰'}</button>
      <nav ref={dock} aria-label="Navegação principal" className={`nav-dock ${open ? 'open' : ''}`} onPointerMove={magnify} onPointerLeave={resetMagnification}>
        {links.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'} className="nav-dock-item" aria-label={label} title={label} onClick={() => setOpen(false)}>
            <span className="nav-dock-icon" aria-hidden="true">{icon}</span>
            <span className="nav-dock-label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

