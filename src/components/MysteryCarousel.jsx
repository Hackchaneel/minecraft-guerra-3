import { useState } from 'react'

const cards = ['SEGREDO 01', 'SEGREDO 02', 'SEGREDO 03', 'SEGREDO 04', 'SEGREDO 05']

export default function MysteryCarousel() {
  const [current, setCurrent] = useState(0)
  const select = (index) => setCurrent((index + cards.length) % cards.length)
  const move = (direction) => select(current + direction)

  return (
    <div className="mystery-carousel">
      <div className="mystery-carousel-stage" role="region" aria-label="Carrossel de mistérios" aria-roledescription="carrossel">
        {cards.map((title, index) => {
          let offset = index - current
          if (offset > Math.floor(cards.length / 2)) offset -= cards.length
          if (offset < -Math.floor(cards.length / 2)) offset += cards.length
          const distance = Math.abs(offset)
          const slideStyle = {
            '--slide-position-desktop': String(offset * 210) + 'px',
            '--slide-position-mobile': String(offset * 22) + 'vw',
            '--slide-scale': 1 - distance * 0.12,
            '--slide-rotation': String(offset * -12) + 'deg',
            '--slide-opacity': 1 - distance * 0.24,
            '--slide-brightness': 1 - distance * 0.2,
            zIndex: cards.length - distance,
          }
          return (
            <button
              key={title}
              type="button"
              className={'mystery-card ' + (offset === 0 ? 'is-active' : '')}
              style={slideStyle}
              onClick={() => select(index)}
              aria-label={title + (offset === 0 ? ', selecionado' : ', selecionar')}
              aria-current={offset === 0 ? 'true' : undefined}
            >
              <span className="mystery-card-image" role="img" aria-label="Imagem preta com uma interrogação branca">?</span>
              <span className="mystery-card-title">{title}</span>
            </button>
          )
        })}
      </div>
      <div className="mystery-carousel-controls">
        <button type="button" className="mystery-arrow" onClick={() => move(-1)} aria-label="Cartão anterior">‹</button>
        <div className="mystery-dots" role="group" aria-label="Selecionar cartão">
          {cards.map((title, index) => <button key={title} type="button" className={'mystery-dot ' + (index === current ? 'is-active' : '')} onClick={() => select(index)} aria-label={'Ir para ' + title} aria-current={index === current ? 'true' : undefined} />)}
        </div>
        <button type="button" className="mystery-arrow" onClick={() => move(1)} aria-label="Próximo cartão">›</button>
      </div>
    </div>
  )
}

