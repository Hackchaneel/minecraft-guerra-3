import { useState } from 'react'
import Section from '../components/Section.jsx'
import { team } from '../data/team.js'

export default function Team() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = team[selectedIndex]

  const selectRelative = (step) => {
    setSelectedIndex((current) => (current + step + team.length) % team.length)
  }

  return (
    <Section title="EQUIPE DO MINECRAFT GUERRA 3">
      <div className="team-selector">
        <div className="team-tabs" role="tablist" aria-label="Selecionar colaborador">
          {team.map((member, index) => (
            <button
              key={member.name}
              id={`team-tab-${index}`}
              className={'team-tab' + (index === selectedIndex ? ' is-selected' : '')}
              type="button"
              role="tab"
              aria-selected={index === selectedIndex}
              aria-controls="team-detail-panel"
              tabIndex={index === selectedIndex ? 0 : -1}
              onClick={() => setSelectedIndex(index)}
            >
              <span className="team-avatar team-avatar-small" aria-hidden="true">{member.name[0]}</span>
              {member.name}
            </button>
          ))}
        </div>

        <div id="team-detail-panel" className="team-stage" role="tabpanel" aria-labelledby={`team-tab-${selectedIndex}`}>
          <div className="team-stage-background" aria-hidden="true" />
          <article key={selected.name} className="team-detail">
            <div className="team-avatar team-avatar-large" aria-hidden="true">{selected.name[0]}</div>
            <h3>{selected.name}</h3>
            <span className="team-role">{selected.role}</span>
            <p>{selected.description}</p>
            <div className="team-controls">
              <button type="button" onClick={() => selectRelative(-1)}>ANTERIOR</button>
              <button type="button" onClick={() => selectRelative(1)}>PRÓXIMO</button>
            </div>
          </article>
        </div>
      </div>
    </Section>
  )
}
