import { useEffect, useState } from 'react'
import { pickIndex, nextRotation } from '../utils/spin.js'
const COLORS = ['#1b4d7a', '#7a3b12', '#1f6b3a', '#4a2a7a', '#3a4452', '#0e6b7a', '#a66b00']

function loadSavedItems(items, editable, storageKey) {
  if (!editable || !storageKey) return items
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (saved === null) return items
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim()) : items
  } catch {
    return items
  }
}

// Props: items (string[]), noRepeat (bool), editable (bool), storageKey.
export default function Roulette({ title, items, noRepeat = false, emptyMessage, editable = false, storageKey }) {
  const [customItems, setCustomItems] = useState(() => loadSavedItems(items, editable, storageKey))
  const [draft, setDraft] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [used, setUsed] = useState([])
  const [history, setHistory] = useState([])
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const wheelItems = editable ? customItems : items
  const pool = noRepeat ? wheelItems.filter((x) => !used.includes(x)) : wheelItems

  useEffect(() => {
    if (!editable || !storageKey) return
    try { window.localStorage.setItem(storageKey, JSON.stringify(customItems)) } catch { /* Storage can be disabled by the browser. */ }
  }, [customItems, editable, storageKey])

  if (!editable && !items.length) return <div className="card empty">{emptyMessage}</div>

  const n = pool.length
  const seg = n ? 360 / n : 360
  const labelRadius = 108
  const labelWidth = n ? Math.max(24, Math.min(128, (2 * Math.PI * labelRadius / n) * 0.82)) : 0
  const labelFontSize = n > 24 ? 7 : n > 16 ? 8 : n > 10 ? 9 : n > 8 ? 10 : 12
  const separator = n ? Math.min(1.6, seg * 0.08) : 0
  const bg = n ? `conic-gradient(${pool.flatMap((_, i) => {
    const start = i * seg
    const end = (i + 1) * seg
    const color = COLORS[i % COLORS.length]
    return [`#facc15 ${start}deg ${start + separator}deg`, `${color} ${start + separator}deg ${end}deg`]
  }).join(',')})` : '#17233b'

  const clearSpinState = () => {
    setUsed([]); setHistory([]); setResult(null); setRotation(0)
  }
  const addItems = (event) => {
    event.preventDefault()
    const requested = draft.split(/[\n,;]+/).map((name) => name.trim()).filter(Boolean)
    if (!requested.length) return setEditMessage('Digite pelo menos um nome.')
    const existing = new Set(customItems.map((name) => name.toLocaleLowerCase()))
    const added = []
    for (const name of requested) {
      const key = name.toLocaleLowerCase()
      if (!existing.has(key)) { existing.add(key); added.push(name) }
    }
    if (!added.length) return setEditMessage('Esse nome já está na roleta.')
    setCustomItems((current) => [...current, ...added])
    clearSpinState()
    setDraft('')
    setEditMessage(added.length === 1 ? 'Jogador adicionado.' : `${added.length} jogadores adicionados.`)
  }
  const removeItem = (name) => {
    setCustomItems((current) => current.filter((item) => item !== name))
    clearSpinState()
    setEditMessage(`${name} removido da roleta.`)
  }
  const spin = () => {
    if (spinning || !n) return
    const i = pickIndex(n)
    setSpinning(true); setResult(null)
    setRotation(nextRotation(rotation, i, n))
    setTimeout(() => {
      const winner = pool[i]
      setResult(winner); setHistory((current) => [winner, ...current]); if (noRepeat) setUsed((current) => [...current, winner]); setSpinning(false)
    }, 4200)
  }
  const reset = () => { if (spinning) return; clearSpinState() }

  return (
    <div className="roulette card">
      {title && <h3 className="roulette-title">{title}</h3>}
      {editable && <section className="roulette-editor" aria-label="Editar nomes da roleta de jogadores">
        <form className="player-entry-form" onSubmit={addItems}>
          <label htmlFor={storageKey || 'player-entry'}>Adicionar jogadores</label>
          <div className="player-entry-controls">
            <input id={storageKey || 'player-entry'} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Digite um nome…" autoComplete="off" disabled={spinning} />
            <button className="btn primary" type="submit" disabled={spinning}>ADICIONAR</button>
          </div>
          <p className="player-entry-hint">Você também pode separar vários nomes por vírgula ou linha.</p>
        </form>
        <div className="player-list" aria-label="Jogadores cadastrados">
          {customItems.map((name, index) => <span className="player-chip" key={`${name}-${index}`}>
            {name}<button type="button" aria-label={`Remover ${name}`} title={`Remover ${name}`} onClick={() => removeItem(name)} disabled={spinning}>×</button>
          </span>)}
          {!customItems.length && <span className="sub">Adicione jogadores para montar a roleta.</span>}
        </div>
        <p className="player-entry-status" aria-live="polite">{editMessage}</p>
      </section>}
      {n ? <div className="wheel-wrap">
        <div className="pointer">▼</div>
        <div className="wheel" style={{ background: bg, transform: `rotate(${rotation}deg)` }}>
          {pool.map((name, i) => {
            const angle = i * seg + seg / 2
            return <span key={`${name}-${i}`} className="lbl" style={{ width: `${labelWidth}px`, marginLeft: `${-labelWidth / 2}px`, fontSize: `${labelFontSize}px`, transform: `rotate(${angle}deg) translateY(-${labelRadius}px) rotate(${-angle}deg)` }}>{name}</span>
          })}
        </div>
      </div> : <div className="wheel-empty">{noRepeat && wheelItems.length ? 'Todos os jogadores já foram sorteados. Resete o sorteio para começar novamente.' : (emptyMessage || 'Adicione jogadores para girar a roleta.')}</div>}
      <div className="controls row">
        <button className="btn primary" onClick={spin} disabled={spinning || !n}>{spinning ? 'GIRANDO...' : 'GIRAR ROLETA'}</button>
        <button className="btn" onClick={reset} disabled={spinning || (!used.length && !history.length && !result)}>RESETAR SORTEIO</button>
      </div>
      {!n && !editable && <p className="sub">Todos já foram sorteados. Resete para recomeçar.</p>}
      {result && <div className="result">🎯 {result}</div>}
      <div className="history card"><b>Histórico</b>{history.length ? <ol>{history.map((winner, i) => <li key={`${winner}-${i}`}>{winner}</li>)}</ol> : <p className="sub">Nenhum sorteio ainda.</p>}</div>
    </div>
  )
}

