import Header from '../components/Header'
import Footer from '../components/Footer'
import { CalendarDays, Users, BarChart3, Newspaper, HeartHandshake, Stethoscope, BookOpen, Building2, UserRound, Goal, Scale, MessageSquareText, Lightbulb, ClipboardList } from 'lucide-react'
import { stats, agenda, news } from '../data/mockData'

const causes = [
  [HeartHandshake, 'Assistência Social'],
  [Stethoscope, 'Saúde'],
  [BookOpen, 'Educação'],
  [Building2, 'Infraestrutura'],
  [UserRound, 'Direitos das Mulheres'],
  [Users, 'Juventude'],
  [Goal, 'Esporte e Lazer'],
  [Users, 'Comunidades e Bairros'],
  [Scale, 'Justiça Social'],
]

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">VEREADORA</span>
              <h1>ANDREIA <span>DO JOÃO PAULO II</span></h1>
              <div className="slogan">NA BUSCA POR JUSTIÇA SOCIAL.</div>
              <p>Um mandato presente, construído com diálogo, compromisso e trabalho por Bom Jesus da Lapa.</p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#atuacao">Conheça o mandato</a>
                <a className="btn btn-outline" href="#gabinete">Gabinete online</a>
              </div>
              <small>Bom Jesus da Lapa - Bahia</small>
            </div>

            <div className="hero-photo">
              <div className="photo-placeholder">
                <span>FOTO DA VEREADORA</span>
              </div>
              <div className="hero-shape"></div>
            </div>
          </div>
        </section>

        <section className="quickbar">
          <div className="container quick-grid">
            <a href="#agenda"><CalendarDays /> <div><strong>Agenda</strong><span>Próximos compromissos</span></div></a>
            <a href="#gabinete"><Users /> <div><strong>Gabinete Online</strong><span>Envie solicitações</span></div></a>
            <a href="#transparencia"><BarChart3 /> <div><strong>Transparência</strong><span>Acompanhe o mandato</span></div></a>
            <a href="#noticias"><Newspaper /> <div><strong>Notícias</strong><span>Últimas ações</span></div></a>
          </div>
        </section>

        <section id="sobre" className="section">
          <div className="container two-col">
            <div className="section-photo photo-placeholder"><span>FOTO / HISTÓRIA</span></div>
            <div>
              <span className="section-kicker">CONHEÇA</span>
              <h2>Quem é Andreia?</h2>
              <p>Andreia do João Paulo II construiu sua trajetória com forte presença comunitária, escuta ativa e compromisso com as pessoas.</p>
              <p>Seu mandato tem como prioridade aproximar a política da população, defender direitos e buscar soluções concretas para Bom Jesus da Lapa.</p>
              <blockquote>“Política se faz ouvindo, estando presente e trabalhando por quem mais precisa.”</blockquote>
              <a className="btn btn-primary" href="#atuacao">Conheça minha história</a>
            </div>
          </div>
        </section>

        <section id="atuacao" className="section soft">
          <div className="container">
            <div className="section-heading centered">
              <span className="section-kicker">NOSSO MANDATO</span>
              <h2>Nossas causas</h2>
            </div>
            <div className="cause-grid">
              {causes.map(([Icon, title]) => (
                <div className="cause-card" key={title}>
                  <Icon size={30} />
                  <strong>{title}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="transparencia" className="section">
          <div className="container">
            <div className="section-heading centered">
              <span className="section-kicker">TRANSPARÊNCIA</span>
              <h2>Números do mandato</h2>
            </div>
            <div className="stats-grid">
              {stats.map(item => (
                <div className="stat" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="attendance-panel">
              <div>
                <span className="section-kicker">PRESENÇA NO PLENÁRIO</span>
                <h3>98% de participação nas sessões</h3>
                <p>Área preparada para registrar presença, ausência e justificativa por data.</p>
              </div>
              <div className="attendance-list">
                <div><span>07/08/2026</span><b className="status present">Presente</b></div>
                <div><span>31/07/2026</span><b className="status present">Presente</b></div>
                <div><span>24/07/2026</span><b className="status absent">Ausência justificada</b></div>
              </div>
            </div>
          </div>
        </section>

        <section id="agenda" className="section soft">
          <div className="container">
            <div className="section-heading">
              <span className="section-kicker">AGENDA</span>
              <h2>Acompanhe onde Andreia está</h2>
            </div>
            <div className="agenda-grid">
              {agenda.map(item => (
                <article className="agenda-card" key={item.date + item.title}>
                  <div className="agenda-date">{item.date}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.place}</p>
                    <strong>{item.time}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="gabinete" className="gabinete">
          <div className="container">
            <div className="section-heading centered light">
              <span className="section-kicker">PARTICIPAÇÃO POPULAR</span>
              <h2>Gabinete Online</h2>
              <p>Aqui você tem voz. Aqui você tem vez.</p>
            </div>
            <div className="office-grid">
              <OfficeCard icon={<ClipboardList />} title="Envie uma solicitação" text="Relate um problema ou necessidade da sua comunidade." />
              <OfficeCard icon={<Lightbulb />} title="Envie sua proposta" text="Compartilhe ideias para melhorar Bom Jesus da Lapa." />
              <OfficeCard icon={<MessageSquareText />} title="Fale com o gabinete" text="Entre em contato diretamente com nossa equipe." />
              <OfficeCard icon={<BarChart3 />} title="Acompanhe sua solicitação" text="Consulte o andamento usando seu número de protocolo." />
            </div>

            <form className="demand-form" onSubmit={e => e.preventDefault()}>
              <div className="form-title">
                <h3>Enviar demanda</h3>
                <p>O envio ao Firebase será conectado na próxima etapa.</p>
              </div>
              <div className="form-grid">
                <input placeholder="Nome completo" />
                <input placeholder="Telefone" />
                <input placeholder="E-mail" type="email" />
                <input placeholder="Bairro / Comunidade" />
                <select defaultValue="">
                  <option value="" disabled>Categoria</option>
                  <option>Saúde</option>
                  <option>Educação</option>
                  <option>Infraestrutura</option>
                  <option>Assistência Social</option>
                  <option>Iluminação</option>
                  <option>Limpeza</option>
                  <option>Transporte</option>
                  <option>Outros</option>
                </select>
                <input placeholder="Assunto" />
                <textarea placeholder="Descreva sua solicitação"></textarea>
              </div>
              <button className="btn btn-light" type="submit">Enviar ao gabinete</button>
            </form>
          </div>
        </section>

        <section id="noticias" className="section">
          <div className="container">
            <div className="section-heading">
              <span className="section-kicker">COMUNICAÇÃO</span>
              <h2>Últimas do mandato</h2>
            </div>
            <div className="news-grid">
              {news.map(item => (
                <article className="news-card" key={item.title}>
                  <div className="news-image photo-placeholder"><span>IMAGEM</span></div>
                  <div className="news-content">
                    <div className="news-meta"><b>{item.category}</b><span>{item.date}</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

function OfficeCard({ icon, title, text }) {
  return (
    <div className="office-card">
      <div className="office-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <button className="office-link">Acessar</button>
    </div>
  )
}
