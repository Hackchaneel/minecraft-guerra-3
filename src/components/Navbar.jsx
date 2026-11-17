import { useState } from 'react'
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

  return (
    <header className="nav">
      <NavLink to="/" className="brand" aria-label="Minecraft Guerra 3 — início"><img src={mg3Logo} alt="Minecraft Guerra 3" /></NavLink>
      <button className="burger" type="button" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? '✕' : '☰'}</button>
      <nav aria-label="Navegação principal" className={`nav-dock ${open ? 'open' : ''}`}>
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

