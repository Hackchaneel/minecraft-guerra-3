import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'

const World = lazy(() => import('./pages/World.jsx'))
const Story = lazy(() => import('./pages/Story.jsx'))
const How = lazy(() => import('./pages/How.jsx'))
const Rules = lazy(() => import('./pages/Rules.jsx'))
const RoulettePage = lazy(() => import('./pages/RoulettePage.jsx'))
const Team = lazy(() => import('./pages/Team.jsx'))
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'))
const Secrets = lazy(() => import('./pages/Secrets.jsx'))
export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (<>
    <div className="particles" aria-hidden />
    <Navbar />
    {pathname === '/' && <div className="home-ships" aria-hidden="true">
      <div className="home-ship-gutter home-ship-gutter-right">
        <img className="home-ship home-ship-right" src="./galeao-pirata-ondas-azuis.png" alt="" draggable="false" loading="lazy" decoding="async" />
      </div>
    </div>}
    <main className={pathname === '/roleta' || pathname === '/segredos' ? 'main-wide' : pathname === '/historia' ? 'main-story' : pathname === '/como-funciona' ? 'main-how' : undefined}>
      <Suspense fallback={<div className="route-loading" role="status">Carregando página…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mundo" element={<World />} />
          <Route path="/historia" element={<Story />} />
          <Route path="/como-funciona" element={<How />} />
          <Route path="/regras" element={<Rules />} />
          <Route path="/roleta" element={<RoulettePage />} />
          <Route path="/colaboradores" element={<Team />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/segredos" element={<Secrets />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </main>
    <footer className="footer">MINECRAFT GUERRA 3 · Projeto não oficial da Mojang/Microsoft</footer>
  </>)
}
