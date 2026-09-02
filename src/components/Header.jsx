import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const homeHref = id => location.pathname === '/' ? `#${id}` : `/#${id}`

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-small">VEREADORA</span>
          <strong>ANDREIA</strong>
          <span>DO JOÃO PAULO II</span>
        </Link>

        <nav className="nav">
          <Link to="/perfil">Perfil</Link>
          <a href={homeHref('atuacao')}>Atuação</a>
          <a href={homeHref('agenda')}>Agenda</a>
          <a href={homeHref('proposicoes')}>Proposições</a>
          <a href={homeHref('gabinete')}>Gabinete Online</a>
          <a href={homeHref('transparencia')}>Transparência</a>
          <a href={homeHref('noticias')}>Notícias</a>
        </nav>

        <a className="btn btn-primary" href={homeHref('gabinete')}>Fale com a vereadora</a>
      </div>
    </header>
  )
}
