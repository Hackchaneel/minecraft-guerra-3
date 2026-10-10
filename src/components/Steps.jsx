import { steps } from '../data/steps.js'
export default function Steps() {
  return (<ol className="steps">{steps.map((s, i) => (<li key={s} className="card"><span>{String(i + 1).padStart(2, '0')}</span>{s}</li>))}</ol>)
}
