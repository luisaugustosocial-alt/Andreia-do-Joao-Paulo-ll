import { Link } from 'react-router-dom'
import { ArrowLeft, Home, SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-glow not-found-glow-one" />
      <div className="not-found-glow not-found-glow-two" />

      <section className="not-found-card">
        <div className="not-found-icon">
          <SearchX size={34} strokeWidth={2.2} />
        </div>

        <span className="not-found-kicker">VEREADORA ANDREIA DO JOÃO PAULO II</span>
        <div className="not-found-code">404</div>
        <h1>Página não encontrada</h1>
        <p>
          O endereço que você tentou acessar não existe, foi alterado ou não está mais disponível.
        </p>

        <div className="not-found-actions">
          <Link className="not-found-primary" to="/">
            <Home size={18} />
            Voltar ao início
          </Link>
          <button className="not-found-secondary" type="button" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
            Página anterior
          </button>
        </div>

        <span className="not-found-slogan">Em busca por justiça social.</span>
      </section>
    </main>
  )
}
