import Section from '../components/Section.jsx'
import { team } from '../data/team.js'
export default function Team() {
  return (<Section title="EQUIPE DO MINECRAFT GUERRA 3"><img className="crew" loading="lazy" decoding="async" src="./hack-e-bieul.webp" alt="Hack e Bieul" /><div className="grid">{team.map((m) => (
    <div key={m.name} className="card member"><div className="avatar">{m.name[0]}</div><h3>{m.name}</h3><small>{m.role}</small><p>{m.description}</p></div>))}</div></Section>)
}
