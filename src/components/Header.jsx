import { Link } from 'react-router-dom'
import {
  UserRound,
  Target,
  CalendarDays,
  FileText,
  MessageSquareText,
  BarChart3,
  Newspaper,
  MessageCircle,
  History,
  FolderOpen
} from 'lucide-react'

const menuItems = [
  ['/#sobre', UserRound, 'Sobre'],
  ['/#trajetoria', History, 'Linha do tempo'],
  ['/#atuacao', Target, 'Atuação'],
  ['/#agenda', CalendarDays, 'Agenda'],
  ['/#proposicoes', FileText, 'Proposições'],
  ['/#gabinete', MessageSquareText, 'Gabinete'],
  ['/#transparencia', BarChart3, 'Transparência'],
  ['/#noticias', Newspaper, 'Notícias'],
  ['/#mandatos-anteriores', FolderOpen, 'Mandatos anteriores'],
  ['/#form-demanda', MessageCircle, 'Fale com a vereadora']
]

export default function Header() {
  return (
    <>
      <header className="site-header liquid-top-header">
        <div className="container header-inner liquid-header-inner">
          <Link to="/" className="brand">
            <span className="brand-small">VEREADORA</span>
            <strong>ANDREIA</strong>
            <span>DO JOÃO PAULO II</span>
          </Link>
        </div>
      </header>

      <nav className="liquid-bottom-nav" aria-label="Menu principal">
        <div className="liquid-bottom-nav-inner">
          {menuItems.map(([href, Icon, label], index) => (
            <a
              key={`${href}-${label}`}
              href={href}
              className={`liquid-nav-item ${index === menuItems.length - 1 ? 'liquid-nav-cta' : ''}`}
              aria-label={label}
            >
              <span className="liquid-nav-icon">
                <Icon size={19} strokeWidth={2.1} />
              </span>
              <span className="liquid-nav-label">{label}</span>
            </a>
          ))}
        </div>
      </nav>
    </>
  )
}
