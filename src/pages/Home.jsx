import { Link } from 'react-router-dom'
import ParallaxHeroImages from '../components/ParallaxHeroImages.jsx'
import MysteryCarousel from '../components/MysteryCarousel.jsx'
import { parallaxImages, parallaxCopy } from '../data/parallax.js'
const quick = [['/mundo', '🗺️', 'O Mundo'], ['/historia', '📖', 'A História'], ['/roleta', '🎰', 'Roletas'], ['/regras', '📜', 'Regras']]
export default function Home() {
  return (<div className="home-page"><div className="home-content">
      <div className="home-feature">
        <div className="hero">
          <img className="banner" src="./banner.webp" alt="Minecraft Guerra 3" />
          <h1 className="sr">MINECRAFT GUERRA 3</h1>
          <p>A guerra está prestes a começar.</p>
          <div className="row"><Link className="btn primary" to="/mundo">EXPLORAR O MUNDO</Link><Link className="btn" to="/regras">CONHECER AS REGRAS</Link></div>
        </div>
        <section className="event-panel">
          <h2>LOBBY MG3</h2>
          <p className="sub">Sobrevivência, guerra, exploração, equipes, alianças, traições e eliminação de jogadores.</p>
          <div className="grid quick-grid">{quick.map(([to, i, l]) => <Link key={to} to={to} className="card link"><span className="big">{i}</span>{l}</Link>)}</div>
        </section>
      </div>
      <section className="parallax-hero">
        <ParallaxHeroImages images={parallaxImages} />
        <div className="parallax-copy">
          <h2>{parallaxCopy.title}</h2>
          <p>{parallaxCopy.text}</p>
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

