import { useEffect, useState } from 'react'
import { players as defaultPlayers } from '../data/players.js'
import { islands } from '../data/islands.js'
import { regions } from '../data/regions.js'
import { nextRotation, pickIndex } from '../utils/spin.js'

const STORAGE_KEY = 'mg3:player-roulette-entries'
const COLORS = ['#ff8a2b', '#56d7ff', '#b58cff', '#64e69a', '#ff5f86', '#f4d44d', '#ff9a66', '#79a9ff', '#f38cff', '#a8e063', '#ffc857', '#73e0d0', '#39c6d3', '#e6d27a']

function getPlayers() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === null) return defaultPlayers
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return defaultPlayers
    return [...new Set(parsed.filter((name) => typeof name === 'string').map((name) => name.trim()).filter(Boolean))]
  } catch {
    return defaultPlayers
  }
}

const getRegionId = (islandName) => regions.find((region) => region.name === islandName)?.id

export default function IslandAssignmentRoulette() {
  const [players, setPlayers] = useState(getPlayers)
  const [assignments, setAssignments] = useState([])
  const [history, setHistory] = useState([])
  const [draft, setDraft] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(players)) } catch { /* Browser storage may be disabled. */ }
  }, [players])

  const assignedPlayers = new Set(assignments.map((assignment) => assignment.player))
  const remainingPlayers = players.filter((player) => !assignedPlayers.has(player))
  const islandCounts = new Map(regions.map((region) => [region.id, assignments.filter((assignment) => assignment.regionId === region.id).length]))
  const availableIslands = islands.map((name) => regions.find((region) => region.name === name)).filter((region) => region && islandCounts.get(region.id) < 2)
  const finished = !remainingPlayers.length || !availableIslands.length
  const colorFor = (assignment) => COLORS[assignment.colorIndex % COLORS.length]

  const addPlayers = (event) => {
    event.preventDefault()
    const requested = draft.split(/[\n,;]+/).map((name) => name.trim()).filter(Boolean)
    if (!requested.length) return setEditMessage('Digite pelo menos um nome.')
    const known = new Set(players.map((name) => name.toLocaleLowerCase()))
    const additions = []
    for (const name of requested) {
      const key = name.toLocaleLowerCase()
      if (!known.has(key)) { known.add(key); additions.push(name) }
    }
    if (!additions.length) return setEditMessage('Esses nomes já estão cadastrados.')
    setPlayers((current) => [...current, ...additions])
    setDraft('')
    setEditMessage(additions.length === 1 ? 'Jogador adicionado.' : additions.length + ' jogadores adicionados.')
  }

  const removePlayer = (player) => {
    if (assignedPlayers.has(player) || spinning) return
    setPlayers((current) => current.filter((name) => name !== player))
    setEditMessage(player + ' removido da lista.')
  }

  const spin = () => {
    if (spinning || !remainingPlayers.length || !availableIslands.length) return
    const chosenPlayer = remainingPlayers[pickIndex(remainingPlayers.length)]
    const islandIndex = pickIndex(availableIslands.length)
    const chosenIsland = availableIslands[islandIndex]
    setSpinning(true)
    setResult(null)
    setRotation(nextRotation(rotation, islandIndex, availableIslands.length))
    window.setTimeout(() => {
      setAssignments((current) => [...current, { player: chosenPlayer, regionId: chosenIsland.id, colorIndex: current.length }])
      setHistory((entries) => [{ player: chosenPlayer, island: chosenIsland.name }, ...entries])
      setResult({ player: chosenPlayer, island: chosenIsland.name })
      setSpinning(false)
    }, 4200)
  }

  const reset = () => {
    if (spinning) return
    setAssignments([])
    setHistory([])
    setResult(null)
    setRotation(0)
  }

  return (
    <div className="island-assignment">
      <section className="assignment-map-section" aria-label="Mapa e distribuição de jogadores">
        <div className="assignment-map">
          <img src="./mapa-roleta.png" alt="Mapa do Arquipélago Voxel com os nomes das ilhas" draggable="false" />
          {regions.map((region) => {
            const playersOnIsland = assignments.filter((assignment) => assignment.regionId === region.id)
            return playersOnIsland.map((assignment, index) => {
              const dx = playersOnIsland.length > 1 ? (index === 0 ? -3.3 : 3.3) : 0
              const dy = playersOnIsland.length > 1 ? (index === 0 ? -4.6 : 4.6) : 0
              const left = Math.min(98, Math.max(2, region.x + dx))
              const top = Math.min(96, Math.max(3, region.y + dy))
              const color = colorFor(assignment)
              return (
                <span key={assignment.player} className="assignment-pin" style={{ left: left + '%', top: top + '%', '--pin-color': color }} title={assignment.player + ' — ' + region.name}>
                  <span className="assignment-pin-head" aria-hidden="true" />
                  <span className="assignment-pin-name">{assignment.player}</span>
                </span>
              )
            })
          })}
        </div>
        <div className="assignment-summary">
          <span><b>{assignments.length}</b> jogador(es) distribuído(s) de <b>{players.length}</b></span>
          <span><b>{availableIslands.length}</b> ilha(s) com vaga · máximo de 2 por ilha</span>
        </div>
      </section>

      <section className="assignment-panel" aria-label="Roleta de distribuição">
        <div className="assignment-player-editor">
          <form className="player-entry-form" onSubmit={addPlayers}>
            <label htmlFor="assignment-player-entry">Jogadores</label>
            <div className="player-entry-controls">
              <input id="assignment-player-entry" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Adicionar nomes de jogadores…" autoComplete="off" disabled={spinning} />
              <button className="btn primary" type="submit" disabled={spinning}>ADICIONAR</button>
            </div>
            <p className="player-entry-hint">Separe vários nomes por vírgula ou linha. Cada jogador é sorteado uma vez.</p>
          </form>
          <div className="player-list" aria-label="Lista de jogadores">
            {players.map((player) => {
              const assigned = assignedPlayers.has(player)
              return <span className={'player-chip ' + (assigned ? 'is-assigned' : '')} key={player} style={assigned ? { '--pin-color': colorFor(assignments.find((entry) => entry.player === player)) } : undefined}>
                {player}{assigned && <small>ATRIBUÍDO</small>}
                {!assigned && <button type="button" aria-label={'Remover ' + player} title={'Remover ' + player} onClick={() => removePlayer(player)} disabled={spinning}>×</button>}
              </span>
            })}
            {!players.length && <span className="sub">Adicione jogadores para começar.</span>}
          </div>
          <p className="player-entry-status" aria-live="polite">{editMessage}</p>
        </div>

        <h3 className="roulette-title">ROLETA DE ILHAS</h3>
        <p className="assignment-instructions">Cada rodada sorteia um jogador ainda não atribuído e uma ilha com vaga.</p>
        {availableIslands.length ? <div className="wheel-wrap assignment-wheel-wrap">
          <div className="pointer">▼</div>
          <div className="wheel" style={{ background: `conic-gradient(${availableIslands.map((region, index) => {
            const start = index * (360 / availableIslands.length)
            const end = (index + 1) * (360 / availableIslands.length)
            const color = COLORS[index % COLORS.length]
            return `#facc15 ${start}deg ${start + 1.6}deg, ${color} ${start + 1.6}deg ${end}deg`
          }).join(',')})`, transform: 'rotate(' + rotation + 'deg)' }}>
            {availableIslands.map((region, index) => {
              const segment = 360 / availableIslands.length
              const angle = index * segment + segment / 2
              return <span key={region.id} className="lbl" style={{ width: Math.max(50, Math.min(128, 680 / availableIslands.length)) + 'px', marginLeft: Math.max(50, Math.min(128, 680 / availableIslands.length)) / -2 + 'px', fontSize: (availableIslands.length > 8 ? 9 : 12) + 'px', transform: `rotate(${angle}deg) translateY(-118px) rotate(${-angle}deg)` }}>{region.name}</span>
            })}
          </div>
        </div> : <div className="wheel-empty">{remainingPlayers.length ? 'Todas as ilhas já atingiram o limite de 2 jogadores.' : 'Todos os jogadores já foram distribuídos.'}</div>}

        <div className="controls row assignment-controls">
          <button className="btn primary" type="button" onClick={spin} disabled={spinning || finished}>{spinning ? 'SORTEANDO...' : 'SORTEAR JOGADOR + ILHA'}</button>
          <button className="btn" type="button" onClick={reset} disabled={spinning || !assignments.length}>RESETAR DISTRIBUIÇÃO</button>
        </div>
        {result && <div className="result assignment-result">🎯 {result.player} → {result.island}</div>}
        <p className="assignment-live" aria-live="polite">{!players.length ? 'Adicione jogadores para começar.' : finished ? (remainingPlayers.length ? 'Não há mais vagas disponíveis nas ilhas.' : 'Todos os jogadores foram distribuídos.') : 'Há ' + remainingPlayers.length + ' jogador(es) e ' + availableIslands.length + ' ilha(s) disponíveis.'}</p>
        <div className="history card assignment-history"><b>Distribuição</b>{history.length ? <ol>{history.map((entry, index) => <li key={entry.player + index} style={{ '--pin-color': colorFor(assignments[assignments.length - 1 - index]) }}><span>{entry.player} → {entry.island}</span></li>)}</ol> : <p className="sub">Nenhum jogador sorteado ainda.</p>}</div>
      </section>
    </div>
  )
}



