import { lives } from '../data/steps.js'
export default function Lives() {
  return (<div className="lives">{lives.map((l) => (<div key={l.label} className="card"><div className="hearts">{l.hearts}</div><b>{l.label}</b></div>))}</div>)
}
