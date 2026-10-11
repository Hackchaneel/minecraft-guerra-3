import Section from '../components/Section.jsx'
import { rules } from '../data/rules.js'
function render(lines) {
  const out = []; let list = []
  const flush = () => { if (list.length) { out.push(<ul key={'u' + out.length}>{list}</ul>); list = [] } }
  lines.forEach((l, i) => {
    if (l.startsWith('- ')) return list.push(<li key={i}>{l.slice(2)}</li>)
    flush()
    if (l.startsWith('# ')) out.push(<h4 key={i}>{l.slice(2)}</h4>)
    else if (l.startsWith('! ')) out.push(<p key={i} className="important">{l.slice(2)}</p>)
    else if (l.startsWith('> ')) out.push(<p key={i} className="example">{l.slice(2)}</p>)
    else out.push(<p key={i}>{l}</p>)
  })
  flush(); return out
}
export default function Rules() {
  return (<Section title="REGRAS" subtitle="Informações importantes do Minecraft Guerra 3.">
    <div className="rules-warning" role="note">
      <span className="rules-warning-icon" aria-hidden="true">⚠</span>
      <strong>Atenção! Para participar do Minecraft Guerra 3, é obrigatório a Leitura das Regras.</strong>
    </div>
    <div className="acc">{rules.map((r, i) => (
      <details key={r.title} className="card" open={i === 0}>
        <summary><span>{r.icon}</span> {i + 1}. {r.title}</summary>
        <div className="rbody">{render(r.lines)}</div>
      </details>))}
    </div></Section>)
}
