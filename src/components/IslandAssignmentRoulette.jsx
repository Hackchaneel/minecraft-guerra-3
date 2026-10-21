import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { players as defaultPlayers } from '../data/players.js'
import { islands } from '../data/islands.js'
import { regions } from '../data/regions.js'
import { ADMIN_KEY_STORAGE, callRouletteAdmin, supabase } from '../lib/supabase.js'
import './IslandAssignmentRoulette.css'

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

export default function IslandAssignmentRoulette() {
  const [players, setPlayers] = useState(defaultPlayers)
  const [assignments, setAssignments] = useState([])
  const [history, setHistory] = useState([])
  const [draft, setDraft] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [spotlightRegionId, setSpotlightRegionId] = useState(null)
  const [adminKey] = useState(() => window.sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? '')
  const [sharedStatus, setSharedStatus] = useState('Conectando à roleta compartilhada…')
  const [spinWheelIslands, setSpinWheelIslands] = useState([])
  const mapSectionRef = useRef(null)
  const panelRef = useRef(null)
  const selectionSoundRef = useRef(null)
  const lastPlayerSoundRef = useRef(null)
  const revealTimers = useRef([])
  const seenSpinIdRef = useRef(null)

  useEffect(() => () => revealTimers.current.forEach((timer) => window.clearTimeout(timer)), [])

  const applySharedState = useCallback((row) => {
    if (!row) return
    const nextPlayers = Array.isArray(row.players) ? row.players : defaultPlayers
    const nextAssignments = Array.isArray(row.assignments) ? row.assignments : []
    setPlayers(nextPlayers)
    setAssignments(nextAssignments)
    setHistory([...nextAssignments].reverse().map((assignment) => ({ player: assignment.player, island: assignment.island })))
    setRotation(Number(row.rotation) || 0)
    setSharedStatus('Roleta sincronizada em tempo real.')

    const spinEvent = row.last_spin
    if (!spinEvent?.id || seenSpinIdRef.current === spinEvent.id) return
    seenSpinIdRef.current = spinEvent.id
    const age = Math.max(0, Date.now() - new Date(spinEvent.startedAt).getTime())
    const stillAnimating = age < 4400
    if (!stillAnimating) return
    setSpinWheelIslands((spinEvent.wheelIslands ?? []).map((name) => regions.find((region) => region.name === name)).filter(Boolean))
    setSpinning(true)
    setResult(null)
    const finalSpin = nextAssignments.length >= nextPlayers.length
    const lastPlayerSound = lastPlayerSoundRef.current
    const selectionSound = selectionSoundRef.current
    if (finalSpin && lastPlayerSound && age < 2000) {
      lastPlayerSound.pause()
      lastPlayerSound.currentTime = 0
      lastPlayerSound.volume = .85
      const soundTimer = window.setTimeout(() => lastPlayerSound.play().catch(() => {}), 2000 - age)
      revealTimers.current.push(soundTimer)
    }
    const finishSpin = () => {
      if (!finalSpin && selectionSound) {
        selectionSound.pause()
        selectionSound.currentTime = 0
        selectionSound.volume = .85
        selectionSound.play().catch(() => {})
      }
      setSpinning(false)
      setSpinWheelIslands([])
      setResult({ player: spinEvent.player, island: spinEvent.island })
      setSpotlightRegionId(spinEvent.regionId)
      const resultTimer = window.setTimeout(() => setResult(null), 1800)
      revealTimers.current.push(resultTimer)
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const zoomOutTimer = window.setTimeout(() => {
        setSpotlightRegionId(null)
        const returnTimer = window.setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 1200)
        revealTimers.current.push(returnTimer)
      }, 3200)
      revealTimers.current.push(zoomOutTimer)
    }
    setRotation(Number(spinEvent.rotation) || Number(row.rotation) || 0)
    const finishTimer = window.setTimeout(finishSpin, Math.max(0, 4200 - age))
    revealTimers.current.push(finishTimer)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setSharedStatus('Configure as variáveis do Supabase e reinicie o site.')
      return undefined
    }
    let alive = true
    supabase.from('mg3_roulette_state').select('*').eq('id', true).single().then(({ data, error }) => {
      if (!alive) return
      if (error) setSharedStatus('Banco ainda não configurado. Aplique a migração SQL do projeto Supabase.')
      else applySharedState(data)
    })
    const channel = supabase.channel('mg3-roulette-state')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mg3_roulette_state' }, (payload) => {
        if (alive) applySharedState(payload.new)
      })
      .subscribe((status) => {
        if (alive && status === 'CHANNEL_ERROR') setSharedStatus('Falha ao conectar ao canal de atualização em tempo real.')
      })
    return () => {
      alive = false
      supabase.removeChannel(channel)
    }
  }, [applySharedState])

  const assignedPlayers = new Set(assignments.map((assignment) => assignment.player))
  const remainingPlayers = players.filter((player) => !assignedPlayers.has(player))
  const islandCounts = new Map(regions.map((region) => [region.id, assignments.filter((assignment) => assignment.regionId === region.id).length]))
  const availableIslands = islands.map((name) => regions.find((region) => region.name === name)).filter((region) => region && islandCounts.get(region.id) < 2)
  const wheelIslands = [...availableIslands].sort((a, b) => ROULETTE_ORDER.indexOf(a.name) - ROULETTE_ORDER.indexOf(b.name))
  const finished = !remainingPlayers.length || !availableIslands.length
  const colorFor = (assignment) => COLORS[assignment.colorIndex % COLORS.length]

  const addPlayers = async (event) => {
    event.preventDefault()
    if (!adminKey) return setEditMessage('Entre como administrador para editar os participantes.')
    const requested = draft.split(/[\n,;]+/).map((name) => name.trim()).filter(Boolean)
    if (!requested.length) return setEditMessage('Digite pelo menos um nome.')
    try {
      const { state } = await callRouletteAdmin(adminKey, 'add_players', { players: requested })
      applySharedState(state)
      setDraft('')
      setEditMessage('Lista de jogadores atualizada para todos.')
    } catch (error) { setEditMessage(error.message) }
  }

  const removePlayer = async (player) => {
    if (!adminKey || assignedPlayers.has(player) || spinning) return
    try {
      const { state } = await callRouletteAdmin(adminKey, 'remove_player', { player })
      applySharedState(state)
      setEditMessage(player + ' removido da lista compartilhada.')
    } catch (error) { setEditMessage(error.message) }
  }

  const spin = async () => {
    if (!adminKey || spinning || !remainingPlayers.length || !availableIslands.length) return
    const sounds = [selectionSoundRef.current, lastPlayerSoundRef.current]
    sounds.forEach((sound) => { if (sound) { sound.pause(); sound.currentTime = 0 } })
    try {
      const { state } = await callRouletteAdmin(adminKey, 'spin')
      applySharedState(state)
    } catch (error) { setEditMessage(error.message) }
  }

  const reset = async () => {
    if (!adminKey || spinning) return
    try {
      const { state } = await callRouletteAdmin(adminKey, 'reset')
      setResult(null)
      setSpotlightRegionId(null)
      setSpinWheelIslands([])
      applySharedState(state)
      setEditMessage('Distribuição reiniciada para todos.')
    } catch (error) { setEditMessage(error.message) }
  }

  const displayedWheelIslands = spinning && spinWheelIslands.length ? spinWheelIslands : wheelIslands

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
        <p className="roulette-shared-status" role="status">{sharedStatus} · {adminKey ? 'Modo administrador' : 'Somente visualização — administrador controla a roleta'}</p>
        <div className="assignment-player-editor">
          <form className="player-entry-form" onSubmit={addPlayers}>
            <label htmlFor="assignment-player-entry">Jogadores</label>
            <div className="player-entry-controls">
              <input id="assignment-player-entry" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={adminKey ? 'Adicionar nomes de jogadores…' : 'Disponível apenas para o administrador'} autoComplete="off" disabled={!adminKey || spinning || Boolean(spotlightRegionId)} />
              <button className="btn primary" type="submit" disabled={!adminKey || spinning || Boolean(spotlightRegionId)}>ADICIONAR</button>
            </div>
            <p className="player-entry-hint">Separe vários nomes por vírgula ou linha. Cada jogador é sorteado uma vez.</p>
          </form>
          <div className="player-list" aria-label="Lista de jogadores">
            {players.map((player) => {
              const assigned = assignedPlayers.has(player)
              return <span className={'player-chip ' + (assigned ? 'is-assigned' : '')} key={player} style={assigned ? { '--pin-color': colorFor(assignments.find((entry) => entry.player === player)) } : undefined}>
                {player}{assigned && <small>ATRIBUÍDO</small>}
                {!assigned && adminKey && <button type="button" aria-label={'Remover ' + player} title={'Remover ' + player} onClick={() => removePlayer(player)} disabled={spinning || Boolean(spotlightRegionId)}>×</button>}
              </span>
            })}
            {!players.length && <span className="sub">Adicione jogadores para começar.</span>}
          </div>
          <p className="player-entry-status" aria-live="polite">{editMessage}</p>
        </div>

        <h3 className="roulette-title">ROLETA DE ILHAS</h3>
        <p className="assignment-instructions">Cada rodada sorteia um jogador ainda não atribuído e uma ilha com vaga.</p>
        {displayedWheelIslands.length ? <div className="wheel-wrap assignment-wheel-wrap">
          <div className="pointer">▼</div>
          <div className="wheel" style={{ background: `conic-gradient(${displayedWheelIslands.map((region, index) => {
            const start = index * (360 / displayedWheelIslands.length)
            const end = (index + 1) * (360 / displayedWheelIslands.length)
            const color = ISLAND_COLORS[region.name] ?? COLORS[index % COLORS.length]
            return `#102344 ${start}deg ${start + 1.2}deg, ${color} ${start + 1.2}deg ${end}deg`
          }).join(',')})`, transform: 'rotate(' + rotation + 'deg)' }}>
            <svg className="wheel-island-art" viewBox="0 0 500 500" aria-hidden="true">
              <defs>{displayedWheelIslands.map((region, index) => <clipPath id={'wheel-slice-' + region.id} key={region.id}><path d={rouletteSlicePath(index, displayedWheelIslands.length)} /></clipPath>)}</defs>
              {displayedWheelIslands.map((region, index) => {
                const angle = (-90 + (index + .5) * 360 / displayedWheelIslands.length) * Math.PI / 180
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
            {displayedWheelIslands.map((region, index) => {
              const segment = 360 / displayedWheelIslands.length
              const angle = index * segment + segment / 2
              const labelWidth = Math.max(74, Math.min(150, 800 / displayedWheelIslands.length))
              return <span key={region.id} className="lbl" style={{ width: labelWidth + 'px', marginLeft: labelWidth / -2 + 'px', '--label-angle': angle + 'deg' }}>
                <span className="wheel-label-text" style={{ transform: `rotate(${-rotation}deg)` }}>
                  {ROULETTE_LABELS[region.name].map((line) => <span key={line}>{line}</span>)}
                </span>
              </span>
            })}
          </div>
        </div> : <div className="wheel-empty">{remainingPlayers.length ? 'Todas as ilhas já atingiram o limite de 2 jogadores.' : 'Todos os jogadores já foram distribuídos.'}</div>}

        <div className="controls row assignment-controls">
          <button className="btn primary" type="button" onClick={spin} disabled={!adminKey || spinning || Boolean(spotlightRegionId) || finished}>{spinning ? 'SORTEANDO...' : 'SORTEAR JOGADOR + ILHA'}</button>
          <button className="btn" type="button" onClick={reset} disabled={!adminKey || spinning || Boolean(spotlightRegionId) || !assignments.length}>RESETAR DISTRIBUIÇÃO</button>
        </div>
        <p className="assignment-live" aria-live="polite">{!players.length ? 'Adicione jogadores para começar.' : finished ? (remainingPlayers.length ? 'Não há mais vagas disponíveis nas ilhas.' : 'Todos os jogadores foram distribuídos.') : 'Há ' + remainingPlayers.length + ' jogador(es) e ' + availableIslands.length + ' ilha(s) disponíveis.'}</p>
        <div className="history card assignment-history"><b>Distribuição</b>{history.length ? <ol>{history.map((entry, index) => <li key={entry.player + index} style={{ '--pin-color': colorFor(assignments[assignments.length - 1 - index]) }}><span>{entry.player} → {entry.island}</span></li>)}</ol> : <p className="sub">Nenhum jogador sorteado ainda.</p>}</div>
      </section>
    </div>
  )
}



