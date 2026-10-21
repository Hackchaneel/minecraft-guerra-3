export default function MysteryCarousel({ cards, current, onSelect }) {
  const select = (index) => onSelect((index + cards.length) % cards.length)
  const move = (direction) => select(current + direction)

  return (
    <div className="mystery-carousel">
      <div className="mystery-carousel-stage" role="region" aria-label="Carrossel de mistérios" aria-roledescription="carrossel">
        {cards.map((card, index) => {
          const title = card.title
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
              key={card.id}
              type="button"
              className={'mystery-card ' + (offset === 0 ? 'is-active' : '')}
              style={slideStyle}
              onClick={() => select(index)}
              aria-label={title + (offset === 0 ? ', selecionado' : ', selecionar')}
              aria-current={offset === 0 ? 'true' : undefined}
            >
              <span className="mystery-card-image">
                {cards[index].image
                  ? <img src={cards[index].image} alt={title} loading={distance > 1 ? 'lazy' : 'eager'} />
                  : <span role="img" aria-label="Imagem ainda não adicionada">?</span>}
              </span>
              <span className="mystery-card-copy">
                <span className="mystery-card-title">{title}</span>
                <span className="mystery-card-description">{cards[index].text || 'Uma revelação ainda está por vir.'}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="mystery-carousel-controls">
        <button type="button" className="mystery-arrow" onClick={() => move(-1)} aria-label="Cartão anterior">‹</button>
        <div className="mystery-dots" role="group" aria-label="Selecionar cartão">
          {cards.map((card, index) => <button key={card.id} type="button" className={'mystery-dot ' + (index === current ? 'is-active' : '')} onClick={() => select(index)} aria-label={'Ir para ' + card.title} aria-current={index === current ? 'true' : undefined} />)}
        </div>
        <button type="button" className="mystery-arrow" onClick={() => move(1)} aria-label="Próximo cartão">›</button>
      </div>
    </div>
  )
}

