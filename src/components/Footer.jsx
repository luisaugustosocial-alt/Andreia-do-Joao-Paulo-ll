import { useEffect, useState } from 'react'
import { listenCollection } from '../services/firestore'

export default function Footer() {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    const stop = listenCollection('configuracoes', items => {
      setConfig(items[0] || null)
    })
    return stop
  }, [])

  const socials = [
    ['Instagram', config?.instagram],
    ['Facebook', config?.facebook],
    ['YouTube', config?.youtube],
    ['WhatsApp', config?.whatsapp],
  ].filter(([, url]) => url)

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-name">Vereadora Andreia do João Paulo II</div>
          <p>Na busca por justiça social.</p>
          {!!socials.length && <div className="footer-socials">{socials.map(([name,url]) => <a key={name} href={url} target="_blank" rel="noreferrer">{name}</a>)}</div>}
        </div>
        <div>
          <strong>Bom Jesus da Lapa - Bahia</strong>
          <p>Site institucional do mandato parlamentar.</p>
          {config?.email && <a className="footer-email" href={`mailto:${config.email}`}>{config.email}</a>}
          <div className="footer-legal">
            <a href="/politica-de-privacidade">Política de Privacidade</a>
            <a href="/termos-de-uso">Termos de Uso</a>
          </div>
        </div>
      </div>
      <div className="container footer-copyright">
        <span>© {new Date().getFullYear()} Vereadora Andreia do João Paulo II.</span>
        <span>Todos os direitos reservados.</span>
      </div>
    </footer>
  )
}
