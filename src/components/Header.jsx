import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-small">VEREADORA</span>
          <strong>ANDREIA</strong>
          <span>DO JOÃO PAULO II</span>
        </Link>

        <nav className="nav">
          <a href="#sobre">Sobre</a>
          <a href="#atuacao">Atuação</a>
          <a href="#agenda">Agenda</a>
          <a href="#proposicoes">Proposições</a>
          <a href="#gabinete">Gabinete Online</a>
          <a href="#transparencia">Transparência</a>
          <a href="#noticias">Notícias</a>
        </nav>

        <a className="btn btn-primary" href="#gabinete">Fale com a vereadora</a>
      </div>
    </header>
  )
}
