import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import World from './pages/World.jsx'
import Story from './pages/Story.jsx'
import How from './pages/How.jsx'
import Rules from './pages/Rules.jsx'
import RoulettePage from './pages/RoulettePage.jsx'
import Team from './pages/Team.jsx'
export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (<>
    <div className="particles" aria-hidden />
    <Navbar />
    <div className="coming-soon-gate" role="status" aria-live="polite">
      <div className="coming-soon-message">
        <h1>EM BREVE</h1>
        <p>Página será liberada no dia da Guerra</p>
      </div>
    </div>
    {pathname === '/' && <div className="home-ships" aria-hidden="true">
      <div className="home-ship-gutter home-ship-gutter-right">
        <img className="home-ship home-ship-right" src="./galeao-pirata-ondas-azuis.png" alt="" draggable="false" />
      </div>
    </div>}
    <main className={pathname === '/roleta' ? 'main-wide' : pathname === '/historia' ? 'main-story' : pathname === '/como-funciona' ? 'main-how' : undefined}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mundo" element={<World />} />
        <Route path="/historia" element={<Story />} />
        <Route path="/como-funciona" element={<How />} />
        <Route path="/regras" element={<Rules />} />
        <Route path="/roleta" element={<RoulettePage />} />
        <Route path="/colaboradores" element={<Team />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <footer className="footer">MINECRAFT GUERRA 3 · Projeto não oficial da Mojang/Microsoft</footer>
  </>)
}
