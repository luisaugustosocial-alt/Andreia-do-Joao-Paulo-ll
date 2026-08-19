import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import {
  CalendarDays,
  Users,
  BarChart3,
  Newspaper,
  HeartHandshake,
  Stethoscope,
  BookOpen,
  Building2,
  UserRound,
  Goal,
  Scale,
  MessageSquareText,
  Lightbulb,
  ClipboardList
} from 'lucide-react'
import { createDemandWithTracking, getTrackingByProtocol, listenCollection } from '../services/firestore'
import andreiaFoto from '../assets/andreia-oficial.png'

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

const initialForm = {
  nome: '',
  telefone: '',
  email: '',
  bairro: '',
  categoria: '',
  assunto: '',
  descricao: ''
}

export default function Home() {
  const [agenda, setAgenda] = useState([])
  const [noticias, setNoticias] = useState([])
  const [proposicoes, setProposicoes] = useState([])
  const [sessoes, setSessoes] = useState([])
  const [acoes, setAcoes] = useState([])
  const [form, setForm] = useState(initialForm)
  const [sending, setSending] = useState(false)
  const [protocol, setProtocol] = useState('')
  const [formError, setFormError] = useState('')
  const [selectedNews, setSelectedNews] = useState(null)
  const [trackingProtocol, setTrackingProtocol] = useState('')
  const [trackingResult, setTrackingResult] = useState(null)
  const [trackingError, setTrackingError] = useState('')
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [selectedAgenda, setSelectedAgenda] = useState(null)
  const [selectedProposicao, setSelectedProposicao] = useState(null)
  const [proposicaoFilter, setProposicaoFilter] = useState('Todos')

  useEffect(() => {
    const stops = [
      listenCollection('agenda', setAgenda),
      listenCollection('noticias', setNoticias),
      listenCollection('proposicoes', setProposicoes),
      listenCollection('sessoes', setSessoes),
      listenCollection('acoes', setAcoes),
    ]
    return () => stops.forEach(stop => stop())
  }, [])

  const stats = useMemo(() => {
    const requerimentos = proposicoes.filter(x => x.tipo === 'Requerimento').length
    const indicacoes = proposicoes.filter(x => x.tipo === 'Indicação').length
    const projetos = proposicoes.filter(x => x.tipo === 'Projeto de Lei').length
    const sessoesValidas = sessoes.filter(x => x.status)
    const presentes = sessoesValidas.filter(x => x.status === 'Presente').length
    const percentual = sessoesValidas.length
      ? Math.round((presentes / sessoesValidas.length) * 100)
      : 0
    const comunidades = new Set(acoes.map(x => (x.bairro || '').trim()).filter(Boolean)).size

    return [
      { value: String(requerimentos), label: 'Requerimentos apresentados' },
      { value: String(indicacoes), label: 'Indicações realizadas' },
      { value: String(projetos), label: 'Projetos apresentados' },
      { value: `${percentual}%`, label: 'Presença nas sessões' },
      { value: String(comunidades), label: 'Comunidades visitadas' },
    ]
  }, [proposicoes, sessoes, acoes])

  async function handleDemand(event) {
    event.preventDefault()
    setFormError('')
    setProtocol('')

    if (!form.nome || !form.telefone || !form.bairro || !form.categoria || !form.assunto || !form.descricao) {
      setFormError('Preencha todos os campos obrigatórios.')
      return
    }

    setSending(true)
    try {
      const protocolo = `AND-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
      await createDemandWithTracking(
        {
          ...form,
          status: 'Recebida',
          origem: 'Gabinete Online',
          atualizacaoPublica: 'Sua solicitação foi recebida pelo gabinete.'
        },
        {
          assunto: form.assunto,
          categoria: form.categoria,
          status: 'Recebida',
          atualizacaoPublica: 'Sua solicitação foi recebida pelo gabinete.',
          historico: [
            {
              status: 'Recebida',
              mensagem: 'Sua solicitação foi recebida pelo gabinete.',
              data: new Date().toISOString()
            }
          ]
        },
        protocolo
      )
      setProtocol(protocolo)
      setTrackingProtocol(protocolo)
      setForm(initialForm)
    } catch (error) {
      console.error(error)
      setFormError('Não foi possível enviar sua demanda. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const filteredProposicoes = proposicaoFilter === 'Todos'
    ? proposicoes
    : proposicoes.filter(item => item.tipo === proposicaoFilter)

  async function handleTracking(event) {
    event.preventDefault()
    const normalized = trackingProtocol.trim().toUpperCase()
    setTrackingError('')
    setTrackingResult(null)

    if (!normalized) {
      setTrackingError('Digite o número do protocolo.')
      return
    }

    setTrackingLoading(true)
    try {
      const result = await getTrackingByProtocol(normalized)
      if (!result) {
        setTrackingError('Protocolo não encontrado. Confira o número e tente novamente.')
      } else {
        setTrackingResult(result)
      }
    } catch (error) {
      console.error(error)
      setTrackingError('Não foi possível consultar o protocolo agora.')
    } finally {
      setTrackingLoading(false)
    }
  }

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
                <a className="btn btn-outline" href="#gabinete">Gabinete Online</a>
              </div>
              <small>Bom Jesus da Lapa - Bahia</small>
            </div>
            <div className="hero-photo">
              <img className="andreia-hero-image" src={andreiaFoto} alt="Vereadora Andreia do João Paulo II" />
              <div className="hero-shape"></div>
            </div>
          </div>
        </section>

        <section className="quickbar">
          <div className="container quick-grid">
            <a href="#agenda"><CalendarDays /><div><strong>Agenda</strong><span>Próximos compromissos</span></div></a>
            <a href="#gabinete"><Users /><div><strong>Gabinete Online</strong><span>Envie solicitações</span></div></a>
            <a href="#transparencia"><BarChart3 /><div><strong>Transparência</strong><span>Acompanhe o mandato</span></div></a>
            <a href="#noticias"><Newspaper /><div><strong>Notícias</strong><span>Últimas ações</span></div></a>
          </div>
        </section>

        <section id="sobre" className="section">
          <div className="container two-col">
            <div className="section-photo andreia-about-photo"><img src={andreiaFoto} alt="Vereadora Andreia do João Paulo II" /></div>
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
              <p>Os indicadores abaixo são calculados automaticamente a partir dos registros cadastrados no painel.</p>
            </div>

            <div className="stats-grid auto-stats">
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
                <h3>{stats.find(x => x.label === 'Presença nas sessões')?.value || '0%'} de participação</h3>
                <p>O percentual considera as sessões cadastradas no painel e é atualizado automaticamente.</p>
              </div>
              <div className="attendance-list">
                {sessoes.slice(0, 5).map(sessao => (
                  <div key={sessao.id}>
                    <span>{sessao.data || 'Data não informada'}</span>
                    <b className={`status ${sessao.status === 'Presente' ? 'present' : 'absent'}`}>
                      {sessao.status}
                    </b>
                  </div>
                ))}
                {!sessoes.length && <p>Nenhuma sessão cadastrada ainda.</p>}
              </div>
            </div>
          </div>
        </section>

        <section id="agenda" className="section soft">
          <div className="container">
            <div className="section-heading">
              <span className="section-kicker">AGENDA</span>
              <h2>Acompanhe onde Andreia está</h2>
              <p>Clique em um compromisso para visualizar todos os detalhes.</p>
            </div>

            <div className="agenda-grid">
              {agenda.slice(0, 12).map(item => (
                <button
                  type="button"
                  className={`agenda-card agenda-clickable ${selectedAgenda?.id === item.id ? 'selected' : ''}`}
                  key={item.id}
                  onClick={() => setSelectedAgenda(selectedAgenda?.id === item.id ? null : item)}
                >
                  <div className="agenda-date">{item.data || 'AGENDA'}</div>
                  <div>
                    <h3>{item.titulo}</h3>
                    <p>{item.local || 'Local a definir'}</p>
                    <strong>{item.horario || 'Horário a definir'}</strong>
                    <span className="agenda-more">Ver detalhes</span>
                  </div>
                </button>
              ))}
              {!agenda.length && <p>Nenhum compromisso publicado ainda.</p>}
            </div>

            {selectedAgenda && (
              <div className="public-detail-panel">
                <div className="public-detail-head">
                  <div>
                    <span className="section-kicker">DETALHES DA AGENDA</span>
                    <h3>{selectedAgenda.titulo}</h3>
                  </div>
                  <button type="button" onClick={() => setSelectedAgenda(null)}>Fechar</button>
                </div>

                <div className="public-detail-grid">
                  <div><span>Data</span><strong>{selectedAgenda.data || 'Não informada'}</strong></div>
                  <div><span>Horário</span><strong>{selectedAgenda.horario || 'Não informado'}</strong></div>
                  <div><span>Local</span><strong>{selectedAgenda.local || 'Não informado'}</strong></div>
                  <div className="detail-full">
                    <span>Descrição</span>
                    <p>{selectedAgenda.descricao || 'Nenhuma descrição adicional cadastrada.'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="proposicoes" className="section">
          <div className="container">
            <div className="section-heading">
              <span className="section-kicker">ATUAÇÃO LEGISLATIVA</span>
              <h2>Proposições do mandato</h2>
              <p>Veja requerimentos, indicações, projetos de lei, moções e outras iniciativas apresentadas pelo mandato.</p>
            </div>

            <div className="public-filter-row">
              {['Todos', 'Requerimento', 'Indicação', 'Projeto de Lei', 'Moção', 'Ação Legislativa', 'Outros'].map(type => (
                <button
                  type="button"
                  key={type}
                  className={proposicaoFilter === type ? 'active' : ''}
                  onClick={() => {
                    setProposicaoFilter(type)
                    setSelectedProposicao(null)
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="proposition-list">
              {filteredProposicoes.map(item => (
                <button
                  type="button"
                  className={`proposition-row ${selectedProposicao?.id === item.id ? 'selected' : ''}`}
                  key={item.id}
                  onClick={() => setSelectedProposicao(selectedProposicao?.id === item.id ? null : item)}
                >
                  <div>
                    <span>{item.tipo || 'Proposição'} · {item.numero || 'Sem número'}</span>
                    <strong>{item.titulo || 'Sem título'}</strong>
                  </div>
                  <div>
                    <b>{item.status || 'Sem status'}</b>
                    <small>{item.data || ''}</small>
                  </div>
                </button>
              ))}

              {!filteredProposicoes.length && <p>Nenhuma proposição encontrada nessa categoria.</p>}
            </div>

            {selectedProposicao && (
              <div className="public-detail-panel">
                <div className="public-detail-head">
                  <div>
                    <span className="section-kicker">{selectedProposicao.tipo || 'PROPOSIÇÃO'}</span>
                    <h3>{selectedProposicao.titulo || 'Sem título'}</h3>
                  </div>
                  <button type="button" onClick={() => setSelectedProposicao(null)}>Fechar</button>
                </div>

                <div className="public-detail-grid">
                  <div><span>Número</span><strong>{selectedProposicao.numero || 'Não informado'}</strong></div>
                  <div><span>Data</span><strong>{selectedProposicao.data || 'Não informada'}</strong></div>
                  <div><span>Situação</span><strong>{selectedProposicao.status || 'Não informada'}</strong></div>
                  <div><span>Tipo</span><strong>{selectedProposicao.tipo || 'Não informado'}</strong></div>
                  <div className="detail-full">
                    <span>Descrição / ementa</span>
                    <p>{selectedProposicao.descricao || 'Nenhuma descrição cadastrada.'}</p>
                  </div>
                  {selectedProposicao.linkDocumento && (
                    <div className="detail-full">
                      <span>Documento</span>
                      <a href={selectedProposicao.linkDocumento} target="_blank" rel="noreferrer">
                        Abrir documento relacionado
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
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
              <OfficeCard icon={<ClipboardList />} title="Envie uma solicitação" text="Relate um problema ou necessidade da sua comunidade." target="#form-demanda" />
              <OfficeCard icon={<Lightbulb />} title="Envie sua proposta" text="Compartilhe ideias para melhorar Bom Jesus da Lapa." target="#form-demanda" />
              <OfficeCard icon={<MessageSquareText />} title="Fale com o gabinete" text="Entre em contato diretamente com nossa equipe." target="#form-demanda" />
              <OfficeCard icon={<BarChart3 />} title="Acompanhe sua solicitação" text="Consulte o andamento usando seu número de protocolo." target="#acompanhar" />
            </div>

            <form id="form-demanda" className="demand-form" onSubmit={handleDemand}>
              <div className="form-title">
                <h3>Enviar demanda</h3>
                <p>Sua solicitação será encaminhada diretamente ao painel do mandato.</p>
              </div>

              <div className="form-grid">
                <input value={form.nome} onChange={e => updateField('nome', e.target.value)} placeholder="Nome completo *" />
                <input value={form.telefone} onChange={e => updateField('telefone', e.target.value)} placeholder="Telefone *" />
                <input value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="E-mail" type="email" />
                <input value={form.bairro} onChange={e => updateField('bairro', e.target.value)} placeholder="Bairro / Comunidade *" />
                <select value={form.categoria} onChange={e => updateField('categoria', e.target.value)}>
                  <option value="">Categoria *</option>
                  <option>Saúde</option>
                  <option>Educação</option>
                  <option>Infraestrutura</option>
                  <option>Assistência Social</option>
                  <option>Iluminação</option>
                  <option>Limpeza</option>
                  <option>Transporte</option>
                  <option>Segurança</option>
                  <option>Outros</option>
                </select>
                <input value={form.assunto} onChange={e => updateField('assunto', e.target.value)} placeholder="Assunto *" />
                <textarea value={form.descricao} onChange={e => updateField('descricao', e.target.value)} placeholder="Descreva sua solicitação *" />
              </div>

              {formError && <div className="form-message error-message">{formError}</div>}
              {protocol && (
                <div className="form-message success-message">
                  Solicitação enviada com sucesso. Seu protocolo é <strong>{protocol}</strong>.
                </div>
              )}

              <button className="btn btn-light" type="submit" disabled={sending}>
                {sending ? 'Enviando...' : 'Enviar ao gabinete'}
              </button>
            </form>

            <div id="acompanhar" className="tracking-box">
              <div className="tracking-head">
                <span className="section-kicker">ACOMPANHAMENTO</span>
                <h3>Acompanhe sua solicitação</h3>
                <p>Digite o protocolo recebido no envio da demanda.</p>
              </div>

              <form className="tracking-form" onSubmit={handleTracking}>
                <input
                  value={trackingProtocol}
                  onChange={e => setTrackingProtocol(e.target.value.toUpperCase())}
                  placeholder="Ex.: AND-2026-123456"
                  aria-label="Número do protocolo"
                />
                <button className="btn btn-primary" type="submit" disabled={trackingLoading}>
                  {trackingLoading ? 'Consultando...' : 'Consultar protocolo'}
                </button>
              </form>

              {trackingError && <div className="form-message error-message">{trackingError}</div>}

              {trackingResult && (
                <div className="tracking-result">
                  <div className="tracking-summary">
                    <div>
                      <span>Protocolo</span>
                      <strong>{trackingResult.protocolo}</strong>
                    </div>
                    <div>
                      <span>Status atual</span>
                      <strong className="tracking-status">{trackingResult.status}</strong>
                    </div>
                    <div>
                      <span>Categoria</span>
                      <strong>{trackingResult.categoria || 'Não informada'}</strong>
                    </div>
                  </div>

                  <div className="tracking-subject">
                    <span>Assunto</span>
                    <strong>{trackingResult.assunto || 'Solicitação'}</strong>
                  </div>

                  {trackingResult.atualizacaoPublica && (
                    <div className="tracking-message">
                      <span>Última atualização do gabinete</span>
                      <p>{trackingResult.atualizacaoPublica}</p>
                    </div>
                  )}

                  <div className="tracking-timeline">
                    <h4>Histórico</h4>
                    {(trackingResult.historico || []).slice().reverse().map((item, index) => (
                      <div className="timeline-item" key={`${item.data || index}-${index}`}>
                        <div className="timeline-dot"></div>
                        <div>
                          <strong>{item.status}</strong>
                          <p>{item.mensagem || 'Status atualizado pelo gabinete.'}</p>
                          {item.data && <small>{new Date(item.data).toLocaleString('pt-BR')}</small>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="noticias" className="section">
          <div className="container">
            <div className="section-heading">
              <span className="section-kicker">COMUNICAÇÃO</span>
              <h2>Últimas do mandato</h2>
            </div>
            <div className="news-grid">
              {noticias.slice(0, 8).map(item => (
                <article
                  className="news-card clickable-news"
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedNews(item)
                  }}
                >
                  {item.imagemUrl ? (
                    <img
                      className="news-image-real"
                      src={item.imagemUrl}
                      alt={item.titulo}
                      loading="lazy"
                    />
                  ) : (
                    <div className="news-image photo-placeholder"><span>IMAGEM</span></div>
                  )}

                  <div className="news-content">
                    <div className="news-meta">
                      <b>{item.categoria || 'MANDATO'}</b>
                      <span>{item.data || ''}</span>
                    </div>
                    <h3>{item.titulo}</h3>
                    <p>{item.resumo}</p>
                    <span className="read-news">Ler notícia completa</span>
                  </div>
                </article>
              ))}

              {!noticias.length && <p>Nenhuma notícia publicada ainda.</p>}
            </div>

            {selectedNews && (
              <div className="news-modal-backdrop" onClick={() => setSelectedNews(null)}>
                <article
                  className="news-modal"
                  onClick={e => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                >
                  <button
                    className="news-modal-close"
                    onClick={() => setSelectedNews(null)}
                    aria-label="Fechar notícia"
                  >
                    ×
                  </button>

                  {selectedNews.imagemUrl && (
                    <img
                      className="news-modal-image"
                      src={selectedNews.imagemUrl}
                      alt={selectedNews.titulo}
                    />
                  )}

                  <div className="news-modal-body">
                    <div className="news-meta">
                      <b>{selectedNews.categoria || 'MANDATO'}</b>
                      <span>{selectedNews.data || ''}</span>
                    </div>

                    <h2>{selectedNews.titulo}</h2>

                    {selectedNews.resumo && (
                      <p className="news-modal-lead">{selectedNews.resumo}</p>
                    )}

                    <div className="news-modal-text preserve-lines">
                      {selectedNews.conteudo || selectedNews.resumo || ''}
                    </div>
                  </div>
                </article>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function OfficeCard({ icon, title, text, target }) {
  return (
    <div className="office-card">
      <div className="office-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <a className="office-link" href={target}>Acessar</a>
    </div>
  )
}
