import { useState } from 'react'
import { Link } from 'react-router-dom'
import Section from '../components/Section.jsx'
import { ADMIN_KEY_STORAGE, callRouletteAdmin, setActiveAdminKey } from '../lib/supabase.js'

export default function AdminLogin() {
  const [key, setKey] = useState(() => window.sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? '')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setMessage('Verificando acesso…')
    try {
      await callRouletteAdmin(key, 'verify')
      window.sessionStorage.setItem(ADMIN_KEY_STORAGE, key)
      setActiveAdminKey(key)
      setLoggedIn(true)
      setMessage('Acesso de administrador liberado nesta aba do navegador.')
    } catch (error) {
      window.sessionStorage.removeItem(ADMIN_KEY_STORAGE)
      setActiveAdminKey('')
      setLoggedIn(false)
      setMessage(error.message || 'Não foi possível validar a chave.')
    } finally { setBusy(false) }
  }

  const logout = () => {
    window.sessionStorage.removeItem(ADMIN_KEY_STORAGE)
    setActiveAdminKey('')
    setKey('')
    setLoggedIn(false)
    setMessage('Sessão de administrador encerrada.')
  }

  return <Section title="LOGIN ADMINISTRADOR MG3" subtitle="Apenas o administrador pode editar os participantes e controlar os sorteios.">
    <form className="mg3-admin-login card" onSubmit={submit}>
      <label htmlFor="mg3-admin-key">Chave de acesso</label>
      <input id="mg3-admin-key" type="password" autoComplete="current-password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="Digite a chave de administrador" required />
      <div className="row">
        <button className="btn primary" type="submit" disabled={busy}>{busy ? 'VERIFICANDO…' : 'ENTRAR'}</button>
        {loggedIn && <button className="btn" type="button" onClick={logout}>SAIR</button>}
        <Link className="btn" to="/roleta">IR PARA A ROLETA</Link>
      </div>
      <p className="sub" role="status">{message}</p>
    </form>
  </Section>
}
