import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { players as defaultPlayers } from '../data/players.js'
import { islands } from '../data/islands.js'
import { regions } from '../data/regions.js'
import { nextRotation, pickIndex } from '../utils/spin.js'
import './IslandAssignmentRoulette.css'

const STORAGE_KEY = 'mg3:player-roulette-entries'
const COLORS = ['#ff8a2b', '#56d7ff', '#b58cff', '#64e69a', '#ff5f86', '#f4d44d', '#ff9a66', '#79a9ff', '#f38cff', '#a8e063', '#ffc857', '#73e0d0', '#39c6d3', '#e6d27a']
const ISLAND_COLORS = {
  'Prepúcio Ártico': '#f7f7f2',
  'Cordilheira Rachada': '#a84b13',
  'Triatlo Infernal': '#ed2939',
  'Ruína dos Cristais': '#ff1493',
  'Ilha dos Segredos': '#28a745',
  Camocim: '#d4a017',
  'Maçã Radiativa': '#f4d000',
}
const ROULETTE_ORDER = ['Ruína dos Cristais', 'Maçã Radiativa', 'Ilha dos Segredos', 'Camocim', 'Triatlo Infernal', 'Prepúcio Ártico', 'Cordilheira Rachada']
const ROULETTE_LABELS = {
  'Prepúcio Ártico': ['Prepúcio', 'Ártico'],
  'Cordilheira Rachada': ['Cordilheira', 'Rachada'],
  'Triatlo Infernal': ['Triatlo', 'Infernal'],
  'Ruína dos Cristais': ['Ruína dos', 'Cristais'],
  'Ilha dos Segredos': ['Ilha dos', 'Segredos'],
  Camocim: ['Camocim'],
  'Maçã Radiativa': ['Maçã', 'Radioativa'],
}
const ISLAND_ART = {
  'Prepúcio Ártico': 'prepucio-artico',
  'Cordilheira Rachada': 'cordilheira-rachada',
  'Triatlo Infernal': 'triatlo-infernal',
  'Ruína dos Cristais': 'ruina-dos-cristais',
  'Ilha dos Segredos': 'ilha-dos-segredos',
  Camocim: 'camocim',
  'Maçã Radiativa': 'maca-radiativa',
}

function rouletteSlicePath(index, count, radius = 235) {
  const start = (-90 + index * 360 / count) * Math.PI / 180
  const end = (-90 + (index + 1) * 360 / count) * Math.PI / 180
  const x1 = 250 + radius * Math.cos(start)
  const y1 = 250 + radius * Math.sin(start)
  const x2 = 250 + radius * Math.cos(end)
  const y2 = 250 + radius * Math.sin(end)
  return `M 250 250 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`
}

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
  const [spotlightRegionId, setSpotlightRegionId] = useState(null)
  const mapSectionRef = useRef(null)
  const panelRef = useRef(null)
  const selectionSoundRef = useRef(null)
  const lastPlayerSoundRef = useRef(null)
  const revealTimers = useRef([])

  useEffect(() => () => revealTimers.current.forEach((timer) => window.clearTimeout(timer)), [])

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(players)) } catch { /* Browser storage may be disabled. */ }
  }, [players])

  const assignedPlayers = new Set(assignments.map((assignment) => assignment.player))
  const remainingPlayers = players.filter((player) => !assignedPlayers.has(player))
  const islandCounts = new Map(regions.map((region) => [region.id, assignments.filter((assignment) => assignment.regionId === region.id).length]))
  const availableIslands = islands.map((name) => regions.find((region) => region.name === name)).filter((region) => region && islandCounts.get(region.id) < 2)
  const wheelIslands = [...availableIslands].sort((a, b) => ROULETTE_ORDER.indexOf(a.name) - ROULETTE_ORDER.indexOf(b.name))
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
    const wheelIndex = wheelIslands.findIndex((region) => region.id === chosenIsland.id)
    const isLastPlayerSpin = remainingPlayers.length === 1
    const selectionSound = selectionSoundRef.current
    const lastPlayerSound = lastPlayerSoundRef.current
    const sounds = [selectionSound, lastPlayerSound]
    sounds.forEach((sound) => {
      if (!sound) return
      sound.pause()
      sound.currentTime = 0
    })
    if (isLastPlayerSpin && lastPlayerSound) {
      lastPlayerSound.volume = 0.85
      const delayedLastSound = window.setTimeout(() => lastPlayerSound.play().catch(() => {}), 2000)
      revealTimers.current.push(delayedLastSound)
    }
    setSpinning(true)
    setResult(null)
    setRotation(nextRotation(rotation, wheelIndex, wheelIslands.length))
    window.setTimeout(() => {
      const sound = selectionSoundRef.current
      if (!isLastPlayerSpin && sound) {
        sound.pause()
        sound.currentTime = 0
        sound.volume = 0.85
        sound.play().catch(() => {})
      }
      setAssignments((current) => [...current, { player: chosenPlayer, regionId: chosenIsland.id, colorIndex: current.length }])
      setHistory((entries) => [{ player: chosenPlayer, island: chosenIsland.name }, ...entries])
      setResult({ player: chosenPlayer, island: chosenIsland.name })
      const resultTimer = window.setTimeout(() => setResult(null), 1800)
      revealTimers.current.push(resultTimer)
      setSpinning(false)
      setSpotlightRegionId(chosenIsland.id)
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const zoomOutTimer = window.setTimeout(() => {
        setSpotlightRegionId(null)
        const returnTimer = window.setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 1200)
        revealTimers.current.push(returnTimer)
      }, 3200)
      revealTimers.current.push(zoomOutTimer)
    }, 4200)
  }

  const reset = () => {
    if (spinning) return
    setAssignments([])
    setHistory([])
    setResult(null)
    setRotation(0)
    setSpotlightRegionId(null)
  }

  return (
    <div className="island-assignment">
      <audio ref={selectionSoundRef} src="/roulette-selection.mp3" preload="auto" hidden />
      <audio ref={lastPlayerSoundRef} src="/roulette-last-player.mp3" preload="auto" hidden />
      {result && createPortal(<div className="assignment-player-reveal" role="status" aria-live="assertive"><span>{result.player}</span></div>, document.body)}
      <section ref={mapSectionRef} className="assignment-map-section" aria-label="Mapa e distribuição de jogadores">
        <div className="assignment-map-viewport">
          <div
            className={'assignment-map' + (spotlightRegionId ? ' is-spotlight' : '')}
            style={spotlightRegionId ? {
              '--pan-x': `calc(50% - ${(regions.find((region) => region.id === spotlightRegionId)?.x ?? 50) * 1.6}%)`,
              '--pan-y': `calc(50% - ${(regions.find((region) => region.id === spotlightRegionId)?.y ?? 50) * 1.6}%)`,
            } : undefined}
          >
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
        </div>
        <div className="assignment-summary">
          <span><b>{assignments.length}</b> jogador(es) distribuído(s) de <b>{players.length}</b></span>
          <span><b>{availableIslands.length}</b> ilha(s) com vaga · máximo de 2 por ilha</span>
        </div>
      </section>

      <section ref={panelRef} className="assignment-panel" aria-label="Roleta de distribuição">
        <div className="assignment-player-editor">
          <form className="player-entry-form" onSubmit={addPlayers}>
            <label htmlFor="assignment-player-entry">Jogadores</label>
            <div className="player-entry-controls">
              <input id="assignment-player-entry" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Adicionar nomes de jogadores…" autoComplete="off" disabled={spinning || Boolean(spotlightRegionId)} />
              <button className="btn primary" type="submit" disabled={spinning || Boolean(spotlightRegionId)}>ADICIONAR</button>
            </div>
            <p className="player-entry-hint">Separe vários nomes por vírgula ou linha. Cada jogador é sorteado uma vez.</p>
          </form>
          <div className="player-list" aria-label="Lista de jogadores">
            {players.map((player) => {
              const assigned = assignedPlayers.has(player)
              return <span className={'player-chip ' + (assigned ? 'is-assigned' : '')} key={player} style={assigned ? { '--pin-color': colorFor(assignments.find((entry) => entry.player === player)) } : undefined}>
                {player}{assigned && <small>ATRIBUÍDO</small>}
                {!assigned && <button type="button" aria-label={'Remover ' + player} title={'Remover ' + player} onClick={() => removePlayer(player)} disabled={spinning || Boolean(spotlightRegionId)}>×</button>}
              </span>
            })}
            {!players.length && <span className="sub">Adicione jogadores para começar.</span>}
          </div>
          <p className="player-entry-status" aria-live="polite">{editMessage}</p>
        </div>

        <h3 className="roulette-title">ROLETA DE ILHAS</h3>
        <p className="assignment-instructions">Cada rodada sorteia um jogador ainda não atribuído e uma ilha com vaga.</p>
        {wheelIslands.length ? <div className="wheel-wrap assignment-wheel-wrap">
          <div className="pointer">▼</div>
          <div className="wheel" style={{ background: `conic-gradient(${wheelIslands.map((region, index) => {
            const start = index * (360 / availableIslands.length)
            const end = (index + 1) * (360 / availableIslands.length)
            const color = ISLAND_COLORS[region.name] ?? COLORS[index % COLORS.length]
            return `#102344 ${start}deg ${start + 1.2}deg, ${color} ${start + 1.2}deg ${end}deg`
          }).join(',')})`, transform: 'rotate(' + rotation + 'deg)' }}>
            <svg className="wheel-island-art" viewBox="0 0 500 500" aria-hidden="true">
              <defs>{wheelIslands.map((region, index) => <clipPath id={'wheel-slice-' + region.id} key={region.id}><path d={rouletteSlicePath(index, wheelIslands.length)} /></clipPath>)}</defs>
              {wheelIslands.map((region, index) => {
                const angle = (-90 + (index + .5) * 360 / wheelIslands.length) * Math.PI / 180
                const centerX = 250 + Math.cos(angle) * 150
                const centerY = 250 + Math.sin(angle) * 150
                const imageName = ISLAND_ART[region.name]
                return <image key={region.id} href={'/roulette-islands/' + imageName + '.webp'} x={centerX - 65} y={centerY - 56} width="130" height="112" preserveAspectRatio="xMidYMid meet" clipPath={'url(#wheel-slice-' + region.id + ')'} style={{ transform: `rotate(${-rotation}deg)` }} />
              })}
              <circle cx="250" cy="250" r="238" fill="none" stroke="#1d7cf0" strokeWidth="3" />
              {Array.from({ length: 14 }, (_, index) => {
                const angle = (index * 360 / 14 - 90) * Math.PI / 180
                return <circle key={index} cx={250 + Math.cos(angle) * 238} cy={250 + Math.sin(angle) * 238} r="5.5" fill="#65dcff" stroke="#073c91" strokeWidth="2" />
              })}
            </svg>
            {wheelIslands.map((region, index) => {
              const segment = 360 / wheelIslands.length
              const angle = index * segment + segment / 2
              const labelWidth = Math.max(74, Math.min(150, 800 / wheelIslands.length))
              return <span key={region.id} className="lbl" style={{ width: labelWidth + 'px', marginLeft: labelWidth / -2 + 'px', '--label-angle': angle + 'deg' }}>
                <span className="wheel-label-text" style={{ transform: `rotate(${-rotation}deg)` }}>
                  {ROULETTE_LABELS[region.name].map((line) => <span key={line}>{line}</span>)}
                </span>
              </span>
            })}
          </div>
        </div> : <div className="wheel-empty">{remainingPlayers.length ? 'Todas as ilhas já atingiram o limite de 2 jogadores.' : 'Todos os jogadores já foram distribuídos.'}</div>}

        <div className="controls row assignment-controls">
          <button className="btn primary" type="button" onClick={spin} disabled={spinning || Boolean(spotlightRegionId) || finished}>{spinning ? 'SORTEANDO...' : 'SORTEAR JOGADOR + ILHA'}</button>
          <button className="btn" type="button" onClick={reset} disabled={spinning || Boolean(spotlightRegionId) || !assignments.length}>RESETAR DISTRIBUIÇÃO</button>
        </div>
        <p className="assignment-live" aria-live="polite">{!players.length ? 'Adicione jogadores para começar.' : finished ? (remainingPlayers.length ? 'Não há mais vagas disponíveis nas ilhas.' : 'Todos os jogadores foram distribuídos.') : 'Há ' + remainingPlayers.length + ' jogador(es) e ' + availableIslands.length + ' ilha(s) disponíveis.'}</p>
        <div className="history card assignment-history"><b>Distribuição</b>{history.length ? <ol>{history.map((entry, index) => <li key={entry.player + index} style={{ '--pin-color': colorFor(assignments[assignments.length - 1 - index]) }}><span>{entry.player} → {entry.island}</span></li>)}</ol> : <p className="sub">Nenhum jogador sorteado ainda.</p>}</div>
      </section>
    </div>
  )
}



