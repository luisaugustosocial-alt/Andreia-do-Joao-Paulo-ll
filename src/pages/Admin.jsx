import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Inbox, CalendarDays, Newspaper, FileText, BarChart3, Image, Settings, LogOut } from 'lucide-react'
import { demands, agenda, news, stats } from '../data/mockData'

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

        <Link className="admin-back" to="/"><LogOut size={18}/> Voltar ao site</Link>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="section-kicker">ÁREA ADMINISTRATIVA</span>
            <h1>{menu.find(x => x[0] === tab)?.[2] || 'Painel'}</h1>
          </div>
          <div className="admin-user">
            <div className="avatar">A</div>
            <div><strong>Equipe do mandato</strong><span>Administrador</span></div>
          </div>
        </header>

        {tab === 'dashboard' && <Dashboard />}
        {tab === 'demandas' && <Demandas />}
        {tab === 'agenda' && <EditableList title="Agenda" data={agenda.map(x => ({ titulo:x.title, detalhe:`${x.date} · ${x.time} · ${x.place}` }))} />}
        {tab === 'noticias' && <EditableList title="Notícias" data={news.map(x => ({ titulo:x.title, detalhe:`${x.category} · ${x.date}` }))} />}
        {tab === 'proposicoes' && <Placeholder title="Proposições" text="Cadastre requerimentos, indicações, projetos de lei, moções e acompanhe a situação de cada item." />}
        {tab === 'transparencia' && <Placeholder title="Transparência" text="Atualize presenças, ausências, justificativas e os números públicos do mandato." />}
        {tab === 'midia' && <Placeholder title="Fotos e mídia" text="Área preparada para envio e organização das fotos do site." />}
        {tab === 'config' && <Placeholder title="Configurações" text="Edite contatos, redes sociais, endereço do gabinete, slogan e informações institucionais." />}
      </main>
    </div>
  )
}

function Dashboard() {
  return (
    <>
      <div className="admin-cards">
        {stats.slice(0,4).map(item => <div className="admin-stat" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
      </div>

      <div className="admin-grid">
        <section className="admin-panel">
          <div className="panel-head"><h2>Demandas recentes</h2><span>{demands.length} registros</span></div>
          <DemandTable compact />
        </section>
        <section className="admin-panel">
          <div className="panel-head"><h2>Próxima agenda</h2><span>Atualizável</span></div>
          <div className="simple-list">
            {agenda.map(a => <div key={a.title}><strong>{a.title}</strong><span>{a.date} · {a.time} · {a.place}</span></div>)}
          </div>
        </section>
      </div>
    </>
  )
}

function Demandas() {
  return (
    <section className="admin-panel">
      <div className="panel-head">
        <div><h2>Demandas do Gabinete Online</h2><p>Visualize, filtre e atualize o andamento.</p></div>
        <button className="btn btn-primary">Exportar</button>
      </div>
      <DemandTable />
    </section>
  )
}

function DemandTable() {
  return (
    <div className="table-wrap">
      <table className="demand-table">
        <thead><tr><th>Protocolo</th><th>Nome</th><th>Bairro</th><th>Categoria</th><th>Status</th><th>Data</th></tr></thead>
        <tbody>
          {demands.map(d => (
            <tr key={d.id}>
              <td><strong>{d.id}</strong></td><td>{d.name}</td><td>{d.bairro}</td><td>{d.category}</td>
              <td><span className="status-chip">{d.status}</span></td><td>{d.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EditableList({ title, data }) {
  return (
    <section className="admin-panel">
      <div className="panel-head"><h2>{title}</h2><button className="btn btn-primary">Adicionar novo</button></div>
      <div className="edit-list">
        {data.map((x, i) => <div key={i}><div><strong>{x.titulo}</strong><span>{x.detalhe}</span></div><div><button>Editar</button><button>Excluir</button></div></div>)}
      </div>
    </section>
  )
}

function Placeholder({title, text}) {
  return (
    <section className="admin-panel placeholder-panel">
      <h2>{title}</h2>
      <p>{text}</p>
      <button className="btn btn-primary">Adicionar informação</button>
    </section>
  )
}
