import { useState } from 'react'
import { Link } from 'react-router-dom'
import ParallaxHeroImages from '../components/ParallaxHeroImages.jsx'
import MysteryCarousel from '../components/MysteryCarousel.jsx'
import { parallaxImages, parallaxCopy } from '../data/parallax.js'
import './HomeLobby.css'

function ShortcutIcon({ type }) {
  const paths = {
    book: <path d="M3 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H3zM21 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z" />,
    dice: <path d="M4 4h16v16H4zM8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" />,
    rule: <path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4" />,
  }

  return <svg className="lobby-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>
}

export default function Home() {
  const [teaserPlaying, setTeaserPlaying] = useState(false)
  return (<div className="home-page"><div className="home-content">
      <Link className="mg3-admin-home-link" to="/admin">Login Administrador MG3</Link>
      <Link className="story-announcement" to="/historia">
        <span className="story-announcement-icon" aria-hidden="true">📕</span>
        <span>Capítulos novos da História Disponíveis!!</span>
        <strong>LER AGORA <span aria-hidden="true">→</span></strong>
      </Link>
      <section className="lobby-frame" aria-label="Lobby Minecraft Guerra 3">
        <div className="lobby-art" role="img" aria-label="Imagem principal do Minecraft Guerra 3">
          <span>A guerra está prestes a começar.</span>
        </div>
        <div className="lobby-side">
          <h2>LOBBY MG3</h2>
          <p>Não estamos mais no céu... Agora teremos que sobreviver no Mundo de Baixo.</p>
          <nav className="lobby-menu" aria-label="Atalhos do lobby">
            <Link className="lobby-world-card" to="/mundo">
              <span className="lobby-world-art" aria-hidden="true">
                <img src="/paisagem-voxel-entardecer.png" alt="" />
              </span>
              <span className="lobby-world-copy">
                <b>O Mundo</b>
                <small>Comece explorando o mapa</small>
              </span>
            </Link>
            <Link className="lobby-shortcut" to="/historia"><ShortcutIcon type="book" />História</Link>
            <Link className="lobby-shortcut" to="/roleta"><ShortcutIcon type="dice" />Roletas</Link>
            <Link className="lobby-shortcut" to="/regras"><ShortcutIcon type="rule" />Regras</Link>
          </nav>
        </div>
      </section>
      <section className="parallax-hero">
        <ParallaxHeroImages images={parallaxImages} />
        <div className="parallax-copy">
          <h2>{parallaxCopy.title}</h2>
          <p>{parallaxCopy.text}</p>
        </div>
      </section>
      <section className="teaser-section" aria-labelledby="teaser-title">
        <h2 id="teaser-title">Confira o que aconteceu com as ilhas <span className="teaser-float-word" aria-label="flutuantes"><span aria-hidden="true">f</span><span aria-hidden="true">lutuantes</span></span> no Teaser COLAPSO</h2>
        <div className="teaser-video-frame">
          {teaserPlaying ? <iframe
              src="https://www.youtube-nocookie.com/embed/eRQuVmEgX7w?autoplay=1"
              title="Teaser COLAPSO — Minecraft Guerra 3"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            /> : <button className="teaser-preview" type="button" onClick={() => setTeaserPlaying(true)} aria-label="Reproduzir Teaser COLAPSO">
              <img src="https://img.youtube.com/vi/eRQuVmEgX7w/hqdefault.jpg" alt="" loading="lazy" decoding="async" />
              <span className="teaser-play-icon" aria-hidden="true">▶</span>
            </button>}
        </div>
      </section>
      <section className="mystery-section" aria-labelledby="mystery-heading">
        <div className="mystery-heading">
          <h2 id="mystery-heading">SEGREDOS DO MG3</h2>
          <p className="sub">Algumas revelações ainda estão por vir.</p>
        </div>
        <MysteryCarousel />
      </section>
    </div></div>)
}

