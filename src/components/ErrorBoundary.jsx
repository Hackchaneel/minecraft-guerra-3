import React from 'react'
// Mostra o erro na tela em vez de deixar a página em branco.
export default class ErrorBoundary extends React.Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (!this.state.error) return this.props.children
    return (<div className="crash"><h2>Ops, algo deu errado nesta página</h2>
      <pre>{String(this.state.error?.stack || this.state.error)}</pre>
      <a className="btn primary" href="#/" onClick={() => setTimeout(() => location.reload(), 50)}>VOLTAR AO INÍCIO</a></div>)
  }
}
