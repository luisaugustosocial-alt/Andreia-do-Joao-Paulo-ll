import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { listenCollection } from '../services/firestore'
import andreiaFoto from '../assets/andreia-oficial.png'

export default function Perfil() {
  const [config, setConfig] = useState({})

  useEffect(() => {
    const stop = listenCollection('configuracoes', items => setConfig(items[0] || {}))
    return stop
  }, [])

  const texto = config.perfilTextoCompleto || [
    config.sobreTexto1 || 'Andreia do João Paulo II construiu sua trajetória com forte presença comunitária, escuta ativa e compromisso com as pessoas.',
    config.sobreTexto2 || 'Seu mandato tem como prioridade aproximar a política da população, defender direitos e buscar soluções concretas para Bom Jesus da Lapa.'
  ].join('\n\n')

  return (
    <>
      <Header />
      <main className="legal-page profile-page">
        <div className="container profile-layout">
          <div className="profile-photo-wrap">
            <img src={andreiaFoto} alt="Vereadora Andreia do João Paulo II" />
          </div>
          <article className="profile-copy">
            <span className="section-kicker">PERFIL</span>
            <h1>{config.sobreTitulo || 'Quem é Andreia?'}</h1>
            <div className="profile-text">
              {texto.split('\n').map((paragraph, index) => paragraph.trim() ? <p key={index}>{paragraph}</p> : null)}
            </div>
            {config.sobreCitacao && <blockquote>{config.sobreCitacao}</blockquote>}
          </article>
        </div>
      </main>
      <Footer />
    </>
  )
}
