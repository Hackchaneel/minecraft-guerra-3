import { useRef, useState } from 'react'

const topics = [
  {
    title: 'Sorteio e Spawn',
    points: ['Cada jogador será sorteado para spawnar em uma ilha pela roleta.']
  },
  {
    title: 'Vidas',
    points: ['Cada jogador terá direito a 3 vidas.', 'Será iniciado um timer de 1 hora para as 3 vidas começarem a valer de verdade.']
  },
  {
    title: 'Navios e o Mar',
    points: ['O mar é corrosivo. Se entrar nele, o jogador levará dano.', 'Haverá navios para os jogadores se locomoverem sozinhos ou em grupo.']
  },
  {
    title: 'Intervalo',
    points: ['Após algum tempo de sessão, haverá um intervalo de 1 hora para necessidades pessoais.', 'Haverá uma tolerância de, no máximo, 10 minutos.']
  },
  {
    title: 'Tesouros e Baús',
    points: ['Tesouros e baús piratas estarão espalhados pelo mapa.', 'Eles conterão itens valiosos e poderosos para ajudar os jogadores a enfrentar os oponentes.']
  },
  {
    title: 'Segredos do Site',
    points: ['Durante a sessão, alguns segredos serão revelados no site do Minecraft Guerra 3.', 'Esses segredos levarão os jogadores a lugares específicos do mapa.']
  },
  {
    title: 'Segunda Sessão',
    points: ['Após o fim da primeira sessão, um vídeo ficará disponível no site do MG3.', 'O vídeo revelará informações e detalhes sobre a segunda sessão.']
  },
  {
    title: 'Repescagem',
    points: ['No começo da segunda sessão, haverá uma repescagem para os jogadores que perderam todas as suas vidas.', 'Eles lutarão entre si, e apenas um jogador voltará com 1 vida para jogar a segunda sessão.']
  },
  {
    title: 'Batalha Final',
    points: ['Quando restarem apenas dois times ou um jogador contra um jogador, começará a Batalha Final.', 'Dois drops serão lançados no mapa para cada time, contendo um item supervalioso e poderoso.', 'As informações sobre a localização desses drops serão sigilosas para cada time.']
  },
  {
    title: 'Vitória e Feedback',
    points: ['Quando um time eliminar completamente o outro, o Minecraft Guerra 3 terminará e os jogadores campeões serão definidos.', 'O jogador campeão terá um local secreto do mapa para visitar.', 'Após o fim do MG3, será disponibilizado um local no site para os jogadores enviarem feedback.']
  }
]

export default function How() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)
  const activeTopic = topics[activeIndex]

  function showTopic(nextIndex) {
    setActiveIndex((nextIndex + topics.length) % topics.length)
    setTilt({ x: 0, y: 0 })
  }

  function handlePointerMove(event) {
    if (event.pointerType !== 'mouse' || !cardRef.current) return
    const bounds = cardRef.current.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    setTilt({ x: -y * 9, y: x * 11 })
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      showTopic(activeIndex + 1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showTopic(activeIndex - 1)
    }
  }

  return (
    <section className="how-page" aria-labelledby="how-page-title">
      <div className="how-parchment-panel">
        <h1 id="how-page-title" className="how-page-title">Como vai Funcionar?</h1>
        <p className="how-page-kicker">MINECRAFT GUERRA 3 · TÓPICOS DO EVENTO</p>

        <div className="how-carousel" onKeyDown={handleKeyDown}>
          <button className="how-arrow" type="button" onClick={() => showTopic(activeIndex - 1)} aria-label="Tópico anterior">
            <span aria-hidden="true">←</span>
          </button>

          <div className="how-card-scene">
            <article
              className="how-3d-card"
              key={activeIndex}
              ref={cardRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setTilt({ x: 0, y: 0 })}
              style={{ transform: `perspective(1100px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
              aria-live="polite"
              aria-label={`Tópico ${String(activeIndex + 1).padStart(2, '0')} de ${topics.length}: ${activeTopic.title}`}
            >
              <div className="how-card-glow" aria-hidden="true" />
              <div className="how-card-number" aria-hidden="true">{String(activeIndex + 1).padStart(2, '0')}</div>
              <div className="how-card-content">
                <span className="how-card-eyebrow">TÓPICO {String(activeIndex + 1).padStart(2, '0')} / {String(topics.length).padStart(2, '0')}</span>
                <h2>{activeTopic.title}</h2>
                <ul>
                  {activeTopic.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>
              <div className="how-card-footer"><span>CAMPO DE BATALHA · MG3</span><span>⛏</span></div>
            </article>
          </div>

          <button className="how-arrow" type="button" onClick={() => showTopic(activeIndex + 1)} aria-label="Próximo tópico">
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="how-carousel-status" aria-live="polite">
          <span className="how-progress-track" aria-hidden="true"><span style={{ width: `${((activeIndex + 1) / topics.length) * 100}%` }} /></span>
          <span>{String(activeIndex + 1).padStart(2, '0')} <i>/</i> {String(topics.length).padStart(2, '0')}</span>
        </div>

        <p className="how-page-closing">Nos vemos no campo de batalha!</p>
        <div className="how-additional-info" aria-label="Informações adicionais">
          <span>Versão do servidor: <strong>1.20.6</strong></span>
          <span>Mods: <strong>Small Ships · Simple Voice Chat</strong></span>
        </div>
      </div>
    </section>
  )
}
