import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Inbox, CalendarDays, Newspaper, FileText,
  BarChart3, Image, Settings, LogOut, Plus, Trash2, Check
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import {
  createDocument,
  listenCollection,
  removeDocument,
  updateDocument
} from '../services/firestore'

const menu = [
  ['dashboard', LayoutDashboard, 'Visão geral'],
  ['demandas', Inbox, 'Demandas'],
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
  const navigate = useNavigate()

  useEffect(() => {
    const stops = [
      listenCollection('demandas', setDemandas),
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
        {tab === 'demandas' && <Demandas data={demandas} />}
        {tab === 'agenda' && <Agenda data={agenda} />}
        {tab === 'noticias' && <Noticias data={noticias} />}
        {tab === 'proposicoes' && <Proposicoes data={proposicoes} />}
        {tab === 'transparencia' && <Transparencia sessoes={sessoes} acoes={acoes} />}
        {tab === 'midia' && <Placeholder title="Fotos e mídia" text="O upload de imagens pelo Firebase Storage será a próxima etapa." />}
        {tab === 'config' && <Placeholder title="Configurações" text="Aqui entraremos depois com contatos, redes sociais e informações institucionais." />}
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
  async function changeStatus(item, status) {
    await updateDocument('demandas', item.id, { status })
  }

  return (
    <section className="admin-panel">
      <div className="panel-head"><div><h2>Demandas do Gabinete Online</h2><p>Atualize o andamento de cada solicitação.</p></div></div>
      <div className="table-wrap">
        <table className="demand-table">
          <thead><tr><th>Protocolo</th><th>Nome</th><th>Bairro</th><th>Categoria</th><th>Status</th><th>Ação</th></tr></thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td><strong>{item.protocolo}</strong></td>
                <td>{item.nome}</td>
                <td>{item.bairro}</td>
                <td>{item.categoria}</td>
                <td><span className="status-chip">{item.status}</span></td>
                <td>
                  <select value={item.status || 'Nova'} onChange={e => changeStatus(item, e.target.value)}>
                    <option>Nova</option>
                    <option>Em análise</option>
                    <option>Encaminhada</option>
                    <option>Concluída</option>
                    <option>Arquivada</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.length && <p>Nenhuma demanda recebida ainda.</p>}
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
        <textarea placeholder="Descrição" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/>
        <button className="btn btn-primary"><Plus size={16}/> Adicionar compromisso</button>
      </form>
    }>
      <AdminList collection="agenda" data={data} render={x => `${x.data || ''} · ${x.horario || ''} · ${x.local || ''}`} />
    </CrudSection>
  )
}

function Noticias({ data }) {
  const [form, setForm] = useState({ titulo:'', categoria:'Mandato', data:'', resumo:'' })

  async function submit(e) {
    e.preventDefault()
    if (!form.titulo) return
    await createDocument('noticias', form)
    setForm({ titulo:'', categoria:'Mandato', data:'', resumo:'' })
  }

  return (
    <CrudSection title="Notícias" form={
      <form className="admin-form" onSubmit={submit}>
        <input placeholder="Título" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/>
        <input placeholder="Categoria" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}/>
        <input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})}/>
        <textarea placeholder="Resumo" value={form.resumo} onChange={e=>setForm({...form,resumo:e.target.value})}/>
        <button className="btn btn-primary"><Plus size={16}/> Publicar notícia</button>
      </form>
    }>
      <AdminList collection="noticias" data={data} render={x => `${x.categoria || ''} · ${x.data || ''}`} />
    </CrudSection>
  )
}

function Proposicoes({ data }) {
  const [form, setForm] = useState({ numero:'', tipo:'Requerimento', titulo:'', data:'', status:'Apresentado', descricao:'' })

  async function submit(e) {
    e.preventDefault()
    if (!form.titulo || !form.tipo) return
    await createDocument('proposicoes', form)
    setForm({ numero:'', tipo:'Requerimento', titulo:'', data:'', status:'Apresentado', descricao:'' })
  }

  return (
    <CrudSection title="Proposições legislativas" form={
      <form className="admin-form" onSubmit={submit}>
        <input placeholder="Número" value={form.numero} onChange={e=>setForm({...form,numero:e.target.value})}/>
        <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
          <option>Requerimento</option>
          <option>Indicação</option>
          <option>Projeto de Lei</option>
          <option>Moção</option>
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
        <textarea placeholder="Descrição" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/>
        <button className="btn btn-primary"><Plus size={16}/> Cadastrar proposição</button>
      </form>
    }>
      <AdminList collection="proposicoes" data={data} render={x => `${x.tipo} · ${x.numero || 'Sem número'} · ${x.status}`} />
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

function Placeholder({ title, text }) {
  return (
    <section className="admin-panel placeholder-panel">
      <h2>{title}</h2>
      <p>{text}</p>
    </section>
  )
}
