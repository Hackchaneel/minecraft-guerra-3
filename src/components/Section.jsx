export default function Section({ title, subtitle, children }) {
  return (<section className="section"><h2>{title}</h2>{subtitle && <p className="sub">{subtitle}</p>}{children}</section>)
}
