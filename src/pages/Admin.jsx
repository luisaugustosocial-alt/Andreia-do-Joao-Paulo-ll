import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Inbox, CalendarDays, Newspaper, FileText,
  BarChart3, Image, Settings, LogOut, Plus, Trash2, Check, Archive
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { upload } from '@imagekit/javascript'
import { auth } from '../services/firebase'
import {
  createDocument,
  listenCollection,
  removeDocument,
  updateDocument,
  updateDemandAndTracking
} from '../services/firestore'

const menu = [
  ['dashboard', LayoutDashboard, 'Visão geral'],
  ['demandas', Inbox, 'Demandas'],
  ['arquivadas', Archive, 'Arquivadas'],
  ['agenda', CalendarDays, 'Agenda'],
  ['noticias', Newspaper, 'Notícias'],
  ['proposicoes', FileText, 'Proposições'],
  ['transparencia', BarChart3, 'Transparência'],
  ['midia', Image, 'Fotos e mídia'],
  ['config', Settings, 'Configurações'],
]

export default function Admin() {
  const [tab, setTab] = useState('dashboard')
  const [demandas, setDemandas] = useState([])
  const [agenda, setAgenda] = useState([])
  const [noticias, setNoticias] = useState([])
  const [proposicoes, setProposicoes] = useState([])
  const [sessoes, setSessoes] = useState([])
  const [acoes, setAcoes] = useState([])
  const [configuracoes, setConfiguracoes] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const stops = [
      listenCollection('demandas', setDemandas),
      listenCollection('agenda', setAgenda),
      listenCollection('noticias', setNoticias),
      listenCollection('proposicoes', setProposicoes),
      listenCollection('sessoes', setSessoes),
      listenCollection('acoes', setAcoes),
      listenCollection('configuracoes', setConfiguracoes),
    ]
    return () => stops.forEach(stop => stop())
  }, [])

  const stats = useMemo(() => {
    const requerimentos = proposicoes.filter(x => x.tipo === 'Requerimento').length
    const indicacoes = proposicoes.filter(x => x.tipo === 'Indicação').length
    const projetos = proposicoes.filter(x => x.tipo === 'Projeto de Lei').length
    const presentes = sessoes.filter(x => x.status === 'Presente').length
    const presenca = sessoes.length ? Math.round((presentes / sessoes.length) * 100) : 0
    return [
      [requerimentos, 'Requerimentos'],
      [indicacoes, 'Indicações'],
      [projetos, 'Projetos'],
      [`${presenca}%`, 'Presença'],
      [demandas.length, 'Demandas recebidas'],
      [new Set(acoes.map(x => x.bairro).filter(Boolean)).size, 'Comunidades'],
    ]
  }, [proposicoes, sessoes, demandas, acoes])

  async function handleLogout() {
    await signOut(auth)
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/">
          <span>VEREADORA</span>
          <strong>ANDREIA</strong>
          <small>PAINEL DO MANDATO</small>
        </Link>

        <nav>
          {menu.map(([key, Icon, label]) => (
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        <button className="admin-back admin-logout" onClick={handleLogout}>
          <LogOut size={18}/> Sair do painel
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="section-kicker">ÁREA ADMINISTRATIVA</span>
            <h1>{menu.find(x => x[0] === tab)?.[2]}</h1>
          </div>
          <div className="admin-user">
            <div className="avatar">A</div>
            <div><strong>Equipe do mandato</strong><span>Administrador</span></div>
          </div>
        </header>

        {tab === 'dashboard' && <Dashboard stats={stats} demandas={demandas} agenda={agenda} />}
        {tab === 'demandas' && <Demandas data={demandas.filter(item => item.arquivada !== true)} />}
        {tab === 'arquivadas' && <Arquivadas data={demandas.filter(item => item.arquivada === true)} />}
        {tab === 'agenda' && <Agenda data={agenda} />}
        {tab === 'noticias' && <Noticias data={noticias} />}
        {tab === 'proposicoes' && <Proposicoes data={proposicoes} />}
        {tab === 'transparencia' && <Transparencia sessoes={sessoes} acoes={acoes} />}
        {tab === 'midia' && <Placeholder title="Fotos e mídia" text="O upload de imagens pelo Firebase Storage será a próxima etapa." />}
        {tab === 'config' && <Configuracoes data={configuracoes} />}
      </main>
    </div>
  )
}

function Dashboard({ stats, demandas, agenda }) {
  return (
    <>
      <div className="admin-cards">
        {stats.map(([value, label]) => (
          <div className="admin-stat" key={label}>
            <strong>{value}</strong><span>{label}</span>
          </div>
        ))}
      </div>

      <div className="admin-grid">
        <section className="admin-panel">
          <div className="panel-head"><h2>Demandas recentes</h2><span>{demandas.length} registros</span></div>
          <DemandTable data={demandas.slice(0, 6)} />
        </section>

        <section className="admin-panel">
          <div className="panel-head"><h2>Agenda</h2><span>{agenda.length} registros</span></div>
          <div className="simple-list">
            {agenda.slice(0, 6).map(item => (
              <div key={item.id}><strong>{item.titulo}</strong><span>{item.data} · {item.horario} · {item.local}</span></div>
            ))}
            {!agenda.length && <p>Nenhum compromisso cadastrado.</p>}
          </div>
        </section>
      </div>
    </>
  )
}

function Demandas({ data }) {
  const [drafts, setDrafts] = useState({})
  const [openId, setOpenId] = useState(null)
  const [search, setSearch] = useState('')

  function getDraft(item) {
    return drafts[item.id] || {
      status: item.status || 'Recebida',
      atualizacaoPublica: item.atualizacaoPublica || ''
    }
  }

  function setDraft(item, field, value) {
    setDrafts(prev => ({
      ...prev,
      [item.id]: {
        ...getDraft(item),
        [field]: value
      }
    }))
  }

  function formatDate(value) {
    if (!value) return 'Não informado'

    try {
      if (typeof value?.toDate === 'function') {
        return value.toDate().toLocaleString('pt-BR')
      }

      if (typeof value === 'string') {
        return new Date(value).toLocaleString('pt-BR')
      }

      return String(value)
    } catch {
      return 'Não informado'
    }
  }

  async function archiveDemand(item) {
    const confirmed = window.confirm('Arquivar esta demanda? Ela sairá da lista principal, mas continuará salva.')
    if (!confirmed) return

    await updateDocument('demandas', item.id, {
      arquivada: true,
      arquivadaEm: new Date().toISOString()
    })
  }

  async function deleteDemand(item) {
    const confirmed = window.confirm(
      'Excluir esta demanda definitivamente? Essa ação não poderá ser desfeita.'
    )
    if (!confirmed) return

    await removeDocument('demandas', item.id)

    try {
      await removeDocument('acompanhamentos', item.protocolo || item.id)
    } catch (error) {
      console.warn('Acompanhamento público não removido:', error)
    }
  }

  async function saveUpdate(item) {
    const draft = getDraft(item)
    const previousPublic = item.atualizacaoPublica || ''
    const statusChanged = draft.status !== (item.status || 'Recebida')
    const messageChanged = draft.atualizacaoPublica !== previousPublic

    const existingPublicHistory = Array.isArray(item.historicoPublico)
      ? item.historicoPublico
      : []

    const newEntry = {
      status: draft.status,
      mensagem: draft.atualizacaoPublica || 'Status atualizado pelo gabinete.',
      data: new Date().toISOString()
    }

    await updateDemandAndTracking(
      item.protocolo || item.id,
      {
        status: draft.status,
        atualizacaoPublica: draft.atualizacaoPublica,
        historicoPublico: (statusChanged || messageChanged)
          ? [...existingPublicHistory, newEntry]
          : existingPublicHistory
      },
      {
        status: draft.status,
        atualizacaoPublica: draft.atualizacaoPublica,
        assunto: item.assunto || '',
        categoria: item.categoria || '',
        historico: (statusChanged || messageChanged)
          ? [...existingPublicHistory, newEntry]
          : existingPublicHistory
      }
    )

    setDrafts(prev => {
      const copy = { ...prev }
      delete copy[item.id]
      return copy
    })
  }

  const filteredData = data.filter(item => {
    const term = search.trim().toUpperCase()
    if (!term) return true
    return (item.protocolo || item.id || '').toUpperCase().includes(term)
  })

  return (
    <section className="admin-panel">
      <div className="panel-head">
        <div>
          <h2>Demandas do Gabinete Online</h2>
          <p>Veja todos os dados enviados e atualize o andamento de cada solicitação.</p>
        </div>
        <span>{data.length} demanda(s)</span>
      </div>

      <div className="demand-search-bar">
        <input
          value={search}
          onChange={e => setSearch(e.target.value.toUpperCase())}
          placeholder="Pesquisar pelo protocolo, ex.: AND-2026-123456"
        />
        {search && (
          <button className="btn btn-outline" type="button" onClick={() => setSearch('')}>
            Limpar
          </button>
        )}
      </div>

      <div className="demand-admin-list">
        {filteredData.map(item => {
          const draft = getDraft(item)
          const isOpen = openId === item.id

          return (
            <article className="demand-admin-card" key={item.id}>
              <div className="demand-admin-head">
                <div>
                  <span className="section-kicker">{item.protocolo || item.id}</span>
                  <h3>{item.assunto || 'Solicitação'}</h3>
                  <p>
                    {item.nome || 'Nome não informado'} · {item.bairro || 'Bairro não informado'} · {item.categoria || 'Sem categoria'}
                  </p>
                </div>

                <div className="demand-card-actions">
                  <span className="status-chip">{item.status || 'Recebida'}</span>
                  <button
                    type="button"
                    className="btn btn-outline admin-small-button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                  >
                    {isOpen ? 'Ocultar dados' : 'Ver todos os dados'}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="demand-full-details">
                  <div className="demand-detail-item">
                    <span>Nome completo</span>
                    <strong>{item.nome || 'Não informado'}</strong>
                  </div>

                  <div className="demand-detail-item">
                    <span>Telefone</span>
                    <strong>{item.telefone || 'Não informado'}</strong>
                  </div>

                  <div className="demand-detail-item">
                    <span>E-mail</span>
                    <strong>{item.email || 'Não informado'}</strong>
                  </div>

                  <div className="demand-detail-item">
                    <span>Bairro / Comunidade</span>
                    <strong>{item.bairro || 'Não informado'}</strong>
                  </div>

                  <div className="demand-detail-item">
                    <span>Categoria</span>
                    <strong>{item.categoria || 'Não informada'}</strong>
                  </div>

                  <div className="demand-detail-item">
                    <span>Assunto</span>
                    <strong>{item.assunto || 'Não informado'}</strong>
                  </div>

                  <div className="demand-detail-item">
                    <span>Protocolo</span>
                    <strong>{item.protocolo || item.id}</strong>
                  </div>

                  <div className="demand-detail-item">
                    <span>Status</span>
                    <strong>{item.status || 'Recebida'}</strong>
                  </div>

                  <div className="demand-detail-item">
                    <span>Origem</span>
                    <strong>{item.origem || 'Gabinete Online'}</strong>
                  </div>

                  <div className="demand-detail-item">
                    <span>Data de envio</span>
                    <strong>{formatDate(item.createdAt)}</strong>
                  </div>

                  <div className="demand-detail-item full-width">
                    <span>Descrição completa da demanda</span>
                    <p>{item.descricao || 'Nenhuma descrição informada.'}</p>
                  </div>

                  <div className="demand-detail-item full-width">
                    <span>Última atualização pública</span>
                    <p>{item.atualizacaoPublica || 'Nenhuma atualização publicada ainda.'}</p>
                  </div>
                </div>
              )}

              <div className="demand-update-grid">
                <label>
                  Status
                  <select
                    value={draft.status}
                    onChange={e => setDraft(item, 'status', e.target.value)}
                  >
                    <option>Recebida</option>
                    <option>Em análise</option>
                    <option>Encaminhada</option>
                    <option>Aguardando retorno</option>
                    <option>Concluída</option>
                    <option>Arquivada</option>
                  </select>
                </label>

                <label>
                  Atualização visível para o cidadão
                  <textarea
                    value={draft.atualizacaoPublica}
                    onChange={e => setDraft(item, 'atualizacaoPublica', e.target.value)}
                    placeholder="Ex.: A demanda foi encaminhada ao setor responsável."
                  />
                </label>
              </div>

              <div className="demand-action-row">
                <button className="btn btn-primary" onClick={() => saveUpdate(item)}>
                  <Check size={16}/> Salvar atualização
                </button>

                <button className="btn btn-outline" onClick={() => archiveDemand(item)}>
                  <Archive size={16}/> Arquivar
                </button>

                <button className="btn danger-action" onClick={() => deleteDemand(item)}>
                  <Trash2 size={16}/> Excluir definitivamente
                </button>
              </div>
            </article>
          )
        })}

        {!filteredData.length && <p>Nenhuma demanda encontrada para esse protocolo.</p>}
      </div>
    </section>
  )
}


function Arquivadas({ data }) {
  async function restoreDemand(item) {
    const confirmed = window.confirm('Restaurar esta demanda para a lista principal?')
    if (!confirmed) return

    await updateDocument('demandas', item.id, {
      arquivada: false,
      arquivadaEm: null
    })
  }

  async function deleteDemand(item) {
    const confirmed = window.confirm(
      'Excluir esta demanda definitivamente? Essa ação não poderá ser desfeita.'
    )
    if (!confirmed) return

    await removeDocument('demandas', item.id)

    try {
      await removeDocument('acompanhamentos', item.protocolo || item.id)
    } catch (error) {
      console.warn('Acompanhamento público não removido:', error)
    }
  }

  return (
    <section className="admin-panel">
      <div className="panel-head">
        <div>
          <h2>Demandas arquivadas</h2>
          <p>Demandas retiradas da lista principal, mas mantidas no histórico do gabinete.</p>
        </div>
        <span>{data.length} arquivada(s)</span>
      </div>

      <div className="demand-admin-list">
        {data.map(item => (
          <article className="demand-admin-card archived-card" key={item.id}>
            <div className="demand-admin-head">
              <div>
                <span className="section-kicker">{item.protocolo || item.id}</span>
                <h3>{item.assunto || 'Solicitação'}</h3>
                <p>
                  {item.nome || 'Nome não informado'} · {item.bairro || 'Bairro não informado'} · {item.categoria || 'Sem categoria'}
                </p>
              </div>
              <span className="status-chip">Arquivada</span>
            </div>

            <div className="demand-private-details">
              <p><strong>Status anterior:</strong> {item.status || 'Não informado'}</p>
              <p><strong>Descrição:</strong> {item.descricao || 'Sem descrição.'}</p>
              <p><strong>Contato:</strong> {item.telefone || '—'} {item.email ? `· ${item.email}` : ''}</p>
            </div>

            <div className="demand-action-row">
              <button className="btn btn-primary" onClick={() => restoreDemand(item)}>
                Restaurar
              </button>

              <button className="btn danger-action" onClick={() => deleteDemand(item)}>
                <Trash2 size={16}/> Excluir definitivamente
              </button>
            </div>
          </article>
        ))}

        {!data.length && <p>Nenhuma demanda arquivada.</p>}
      </div>
    </section>
  )
}

function DemandTable({ data }) {
  return (
    <div className="table-wrap">
      <table className="demand-table">
        <thead><tr><th>Protocolo</th><th>Nome</th><th>Bairro</th><th>Categoria</th><th>Status</th></tr></thead>
        <tbody>
          {data.map(d => (
            <tr key={d.id}>
              <td><strong>{d.protocolo}</strong></td><td>{d.nome}</td><td>{d.bairro}</td><td>{d.categoria}</td>
              <td><span className="status-chip">{d.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Agenda({ data }) {
  const [form, setForm] = useState({ titulo:'', data:'', horario:'', local:'', descricao:'' })
  const [selected, setSelected] = useState(null)

  async function submit(e) {
    e.preventDefault()
    if (!form.titulo || !form.data) return
    await createDocument('agenda', form)
    setForm({ titulo:'', data:'', horario:'', local:'', descricao:'' })
  }

  return (
    <CrudSection title="Agenda do mandato" form={
      <form className="admin-form" onSubmit={submit}>
        <input placeholder="Título" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/>
        <input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})}/>
        <input type="time" value={form.horario} onChange={e=>setForm({...form,horario:e.target.value})}/>
        <input placeholder="Local" value={form.local} onChange={e=>setForm({...form,local:e.target.value})}/>
        <textarea placeholder="Descrição detalhada do compromisso" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/>
        <button className="btn btn-primary"><Plus size={16}/> Adicionar compromisso</button>
      </form>
    }>
      <div className="admin-detailed-list">
        {data.map(item => (
          <div className="admin-detailed-row" key={item.id}>
            <button className="admin-detail-open" onClick={() => setSelected(selected?.id === item.id ? null : item)}>
              <strong>{item.titulo}</strong>
              <span>{item.data || ''} · {item.horario || ''} · {item.local || ''}</span>
              <small>{selected?.id === item.id ? 'Ocultar detalhes' : 'Ver detalhes'}</small>
            </button>
            <button className="danger-button" onClick={() => removeDocument('agenda', item.id)}>
              <Trash2 size={15}/> Excluir
            </button>

            {selected?.id === item.id && (
              <div className="admin-detail-panel">
                <div><span>Data</span><strong>{item.data || 'Não informada'}</strong></div>
                <div><span>Horário</span><strong>{item.horario || 'Não informado'}</strong></div>
                <div><span>Local</span><strong>{item.local || 'Não informado'}</strong></div>
                <div className="detail-full"><span>Descrição</span><p>{item.descricao || 'Nenhuma descrição cadastrada.'}</p></div>
              </div>
            )}
          </div>
        ))}
        {!data.length && <p>Nenhum compromisso cadastrado.</p>}
      </div>
    </CrudSection>
  )
}

function Noticias({ data }) {
  const [form, setForm] = useState({
    titulo: '',
    categoria: 'Mandato',
    data: '',
    resumo: '',
    conteudo: '',
    imagemUrl: '',
    imagemFileId: ''
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')

  function chooseFile(event) {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      setError('Escolha um arquivo de imagem.')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 10 MB.')
      return
    }

    setError('')
    setFile(selectedFile)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(selectedFile))
  }

  async function uploadImage() {
    if (!file) return null

    const user = auth.currentUser
    if (!user) throw new Error('Administrador não autenticado.')

    const idToken = await user.getIdToken()

    const authResponse = await fetch('/api/imagekit-auth', {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    })

    if (!authResponse.ok) {
      throw new Error(await authResponse.text())
    }

    const { token, expire, signature, publicKey } = await authResponse.json()

    return upload({
      file,
      fileName: `${Date.now()}-${file.name.replace(/\s+/g, '-').toLowerCase()}`,
      folder: '/site-andreia/noticias',
      token,
      expire,
      signature,
      publicKey,
      onProgress: event => {
        if (event.total) {
          setProgress(Math.round((event.loaded / event.total) * 100))
        }
      }
    })
  }

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (!form.titulo || !form.data || !form.resumo || !form.conteudo) {
      setError('Preencha título, data, resumo e texto completo.')
      return
    }

    if (!file) {
      setError('Escolha uma foto para a notícia.')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const uploaded = await uploadImage()

      await createDocument('noticias', {
        titulo: form.titulo,
        categoria: form.categoria,
        data: form.data,
        resumo: form.resumo,
        conteudo: form.conteudo,
        imagemUrl: uploaded.url,
        imagemFileId: uploaded.fileId || ''
      })

      if (preview) URL.revokeObjectURL(preview)

      setForm({
        titulo: '',
        categoria: 'Mandato',
        data: '',
        resumo: '',
        conteudo: '',
        imagemUrl: '',
        imagemFileId: ''
      })
      setFile(null)
      setPreview('')
      setProgress(0)
    } catch (err) {
      console.error(err)
      setError('Não foi possível publicar a notícia. Verifique a imagem e tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <CrudSection title="Notícias" form={
      <form className="admin-form news-admin-form" onSubmit={submit}>
        <input
          placeholder="Título"
          value={form.titulo}
          onChange={e => setForm({ ...form, titulo: e.target.value })}
        />

        <input
          placeholder="Categoria"
          value={form.categoria}
          onChange={e => setForm({ ...form, categoria: e.target.value })}
        />

        <input
          type="date"
          value={form.data}
          onChange={e => setForm({ ...form, data: e.target.value })}
        />

        <div className="news-image-upload">
          <label className="image-upload-label">
            Foto da notícia
            <input type="file" accept="image/*" onChange={chooseFile} />
          </label>

          {preview && (
            <img
              className="news-upload-preview"
              src={preview}
              alt="Prévia da notícia"
            />
          )}

          {uploading && (
            <div className="upload-progress">
              <div style={{ width: `${progress}%` }} />
              <span>{progress}%</span>
            </div>
          )}
        </div>

        <textarea
          placeholder="Resumo que aparece no card"
          value={form.resumo}
          onChange={e => setForm({ ...form, resumo: e.target.value })}
        />

        <textarea
          className="news-full-text-input"
          placeholder="Texto completo da notícia"
          value={form.conteudo}
          onChange={e => setForm({ ...form, conteudo: e.target.value })}
        />

        {error && <div className="form-message error-message">{error}</div>}

        <button className="btn btn-primary" disabled={uploading}>
          <Plus size={16} />
          {uploading ? 'Enviando imagem...' : 'Publicar notícia'}
        </button>
      </form>
    }>
      <div className="admin-detailed-list">
        {data.map(item => (
          <div className="admin-detailed-row" key={item.id}>
            <button
              className="admin-detail-open news-admin-row"
              onClick={() => setSelected(selected?.id === item.id ? null : item)}
            >
              {item.imagemUrl && (
                <img src={item.imagemUrl} alt="" className="admin-news-thumb" />
              )}
              <div>
                <strong>{item.titulo}</strong>
                <span>{item.categoria || 'Mandato'} · {item.data || ''}</span>
                <small>{selected?.id === item.id ? 'Ocultar detalhes' : 'Ver notícia completa'}</small>
              </div>
            </button>

            <button
              className="danger-button"
              onClick={() => removeDocument('noticias', item.id)}
            >
              <Trash2 size={15} /> Excluir
            </button>

            {selected?.id === item.id && (
              <div className="admin-detail-panel news-admin-detail">
                {item.imagemUrl && (
                  <img
                    src={item.imagemUrl}
                    alt={item.titulo}
                    className="admin-news-detail-image"
                  />
                )}
                <div><span>Categoria</span><strong>{item.categoria || 'Mandato'}</strong></div>
                <div><span>Data</span><strong>{item.data || 'Não informada'}</strong></div>
                <div className="detail-full"><span>Resumo</span><p>{item.resumo || 'Sem resumo.'}</p></div>
                <div className="detail-full"><span>Texto completo</span><p className="preserve-lines">{item.conteudo || 'Sem texto completo.'}</p></div>
              </div>
            )}
          </div>
        ))}

        {!data.length && <p>Nenhuma notícia publicada ainda.</p>}
      </div>
    </CrudSection>
  )
}

function Proposicoes({ data }) {
  const [form, setForm] = useState({
    numero:'',
    tipo:'Requerimento',
    titulo:'',
    data:'',
    status:'Apresentado',
    descricao:'',
    linkDocumento:''
  })
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('Todos')

  async function submit(e) {
    e.preventDefault()
    if (!form.titulo || !form.tipo) return
    await createDocument('proposicoes', form)
    setForm({
      numero:'',
      tipo:'Requerimento',
      titulo:'',
      data:'',
      status:'Apresentado',
      descricao:'',
      linkDocumento:''
    })
  }

  const filtered = filter === 'Todos' ? data : data.filter(item => item.tipo === filter)
  const types = ['Todos', 'Requerimento', 'Indicação', 'Projeto de Lei', 'Moção', 'Ação Legislativa', 'Outros']

  return (
    <CrudSection title="Proposições legislativas" form={
      <form className="admin-form" onSubmit={submit}>
        <input placeholder="Número" value={form.numero} onChange={e=>setForm({...form,numero:e.target.value})}/>
        <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
          <option>Requerimento</option>
          <option>Indicação</option>
          <option>Projeto de Lei</option>
          <option>Moção</option>
          <option>Ação Legislativa</option>
          <option>Outros</option>
        </select>
        <input placeholder="Título / assunto" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/>
        <input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})}/>
        <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
          <option>Apresentado</option>
          <option>Em tramitação</option>
          <option>Aprovado</option>
          <option>Atendido</option>
          <option>Arquivado</option>
        </select>
        <input placeholder="Link do documento (opcional)" value={form.linkDocumento} onChange={e=>setForm({...form,linkDocumento:e.target.value})}/>
        <textarea placeholder="Descrição detalhada / ementa" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/>
        <button className="btn btn-primary"><Plus size={16}/> Cadastrar proposição</button>
      </form>
    }>
      <div className="admin-filter-row">
        {types.map(type => (
          <button
            key={type}
            className={filter === type ? 'active' : ''}
            onClick={() => setFilter(type)}
            type="button"
          >
            {type}
          </button>
        ))}
      </div>

      <div className="admin-detailed-list">
        {filtered.map(item => (
          <div className="admin-detailed-row" key={item.id}>
            <button className="admin-detail-open" onClick={() => setSelected(selected?.id === item.id ? null : item)}>
              <strong>{item.titulo || 'Sem título'}</strong>
              <span>{item.tipo} · {item.numero || 'Sem número'} · {item.status || 'Sem status'}</span>
              <small>{selected?.id === item.id ? 'Ocultar detalhes' : 'Ver detalhes'}</small>
            </button>
            <button className="danger-button" onClick={() => removeDocument('proposicoes', item.id)}>
              <Trash2 size={15}/> Excluir
            </button>

            {selected?.id === item.id && (
              <div className="admin-detail-panel">
                <div><span>Tipo</span><strong>{item.tipo || 'Não informado'}</strong></div>
                <div><span>Número</span><strong>{item.numero || 'Não informado'}</strong></div>
                <div><span>Data</span><strong>{item.data || 'Não informada'}</strong></div>
                <div><span>Situação</span><strong>{item.status || 'Não informada'}</strong></div>
                <div className="detail-full"><span>Título / assunto</span><strong>{item.titulo || 'Não informado'}</strong></div>
                <div className="detail-full"><span>Descrição / ementa</span><p>{item.descricao || 'Nenhuma descrição cadastrada.'}</p></div>
                {item.linkDocumento && (
                  <div className="detail-full">
                    <span>Documento</span>
                    <a href={item.linkDocumento} target="_blank" rel="noreferrer">Abrir documento</a>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {!filtered.length && <p>Nenhuma proposição nessa categoria.</p>}
      </div>
    </CrudSection>
  )
}

function Transparencia({ sessoes, acoes }) {
  const [sessao, setSessao] = useState({ data:'', tipo:'Sessão Ordinária', status:'Presente', justificativa:'' })
  const [acao, setAcao] = useState({ titulo:'', bairro:'', data:'' })

  async function addSessao(e) {
    e.preventDefault()
    if (!sessao.data) return
    await createDocument('sessoes', sessao)
    setSessao({ data:'', tipo:'Sessão Ordinária', status:'Presente', justificativa:'' })
  }

  async function addAcao(e) {
    e.preventDefault()
    if (!acao.titulo || !acao.bairro) return
    await createDocument('acoes', acao)
    setAcao({ titulo:'', bairro:'', data:'' })
  }

  const presentes = sessoes.filter(x => x.status === 'Presente').length
  const percentual = sessoes.length ? Math.round((presentes / sessoes.length) * 100) : 0

  return (
    <>
      <div className="admin-cards">
        <div className="admin-stat"><strong>{sessoes.length}</strong><span>Sessões cadastradas</span></div>
        <div className="admin-stat"><strong>{presentes}</strong><span>Presenças</span></div>
        <div className="admin-stat"><strong>{percentual}%</strong><span>Presença automática</span></div>
        <div className="admin-stat"><strong>{new Set(acoes.map(x=>x.bairro).filter(Boolean)).size}</strong><span>Comunidades visitadas</span></div>
      </div>

      <div className="admin-grid">
        <section className="admin-panel">
          <div className="panel-head"><h2>Registrar sessão</h2></div>
          <form className="admin-form" onSubmit={addSessao}>
            <input type="date" value={sessao.data} onChange={e=>setSessao({...sessao,data:e.target.value})}/>
            <select value={sessao.tipo} onChange={e=>setSessao({...sessao,tipo:e.target.value})}>
              <option>Sessão Ordinária</option>
              <option>Sessão Extraordinária</option>
              <option>Sessão Solene</option>
            </select>
            <select value={sessao.status} onChange={e=>setSessao({...sessao,status:e.target.value})}>
              <option>Presente</option>
              <option>Ausente</option>
              <option>Ausência justificada</option>
            </select>
            <input placeholder="Justificativa, se houver" value={sessao.justificativa} onChange={e=>setSessao({...sessao,justificativa:e.target.value})}/>
            <button className="btn btn-primary"><Check size={16}/> Salvar sessão</button>
          </form>
          <AdminList collection="sessoes" data={sessoes} render={x => `${x.data} · ${x.tipo} · ${x.status}`} />
        </section>

        <section className="admin-panel">
          <div className="panel-head"><h2>Registrar ação/comunidade</h2></div>
          <form className="admin-form" onSubmit={addAcao}>
            <input placeholder="Ação realizada" value={acao.titulo} onChange={e=>setAcao({...acao,titulo:e.target.value})}/>
            <input placeholder="Bairro / Comunidade" value={acao.bairro} onChange={e=>setAcao({...acao,bairro:e.target.value})}/>
            <input type="date" value={acao.data} onChange={e=>setAcao({...acao,data:e.target.value})}/>
            <button className="btn btn-primary"><Plus size={16}/> Registrar ação</button>
          </form>
          <AdminList collection="acoes" data={acoes} render={x => `${x.bairro} · ${x.data || ''}`} />
        </section>
      </div>
    </>
  )
}

function CrudSection({ title, form, children }) {
  return (
    <section className="admin-panel">
      <div className="panel-head"><h2>{title}</h2></div>
      {form}
      <div className="admin-list-space">{children}</div>
    </section>
  )
}

function AdminList({ collection, data, render }) {
  return (
    <div className="edit-list">
      {data.map(item => (
        <div key={item.id}>
          <div><strong>{item.titulo || item.assunto || item.tipo || 'Registro'}</strong><span>{render(item)}</span></div>
          <button className="danger-button" onClick={() => removeDocument(collection, item.id)}><Trash2 size={15}/> Excluir</button>
        </div>
      ))}
      {!data.length && <p>Nenhum registro cadastrado.</p>}
    </div>
  )
}


function Configuracoes({ data }) {
  const current = data[0] || {}
  const [form, setForm] = useState({
    instagram: current.instagram || '',
    facebook: current.facebook || '',
    youtube: current.youtube || '',
    whatsapp: current.whatsapp || '',
    email: current.email || ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const item = data[0] || {}
    setForm({
      instagram: item.instagram || '',
      facebook: item.facebook || '',
      youtube: item.youtube || '',
      whatsapp: item.whatsapp || '',
      email: item.email || ''
    })
  }, [data])

  async function save(e) {
    e.preventDefault()
    setMessage('')

    if (current.id) {
      await updateDocument('configuracoes', current.id, form)
    } else {
      await createDocument('configuracoes', form)
    }

    setMessage('Redes sociais atualizadas com sucesso.')
  }

  return (
    <section className="admin-panel">
      <div className="panel-head">
        <div>
          <h2>Redes sociais e contatos</h2>
          <p>Os links salvos aqui aparecem automaticamente no rodapé do site.</p>
        </div>
      </div>

      <form className="admin-form social-admin-form" onSubmit={save}>
        <input placeholder="Instagram - https://..." value={form.instagram} onChange={e=>setForm({...form,instagram:e.target.value})}/>
        <input placeholder="Facebook - https://..." value={form.facebook} onChange={e=>setForm({...form,facebook:e.target.value})}/>
        <input placeholder="YouTube - https://..." value={form.youtube} onChange={e=>setForm({...form,youtube:e.target.value})}/>
        <input placeholder="WhatsApp - https://wa.me/..." value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})}/>
        <input placeholder="E-mail institucional" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <button className="btn btn-primary" type="submit">Salvar redes sociais</button>
      </form>

      {message && <div className="form-message success-message">{message}</div>}
    </section>
  )
}

function Placeholder({ title, text }) {
  return (
    <section className="admin-panel placeholder-panel">
      <h2>{title}</h2>
      <p>{text}</p>
    </section>
  )
}
