import fs from 'node:fs'

function patch(path, fn) {
  if (!fs.existsSync(path)) return
  const original = fs.readFileSync(path, 'utf8')
  const next = fn(original)
  fs.writeFileSync(path, next, 'utf8')
}

patch('src/pages/Admin.jsx', admin => {
  if (!admin.includes("['colaboradores', Plus, 'Colaboradores']")) {
    admin = admin.replace(
      "  ['arquivadas', Archive, 'Arquivadas'],",
      "  ['arquivadas', Archive, 'Arquivadas'],\n  ['colaboradores', Plus, 'Colaboradores'],"
    )
  }

  if (!admin.includes('const [colaboradores, setColaboradores]')) {
    admin = admin.replace(
      "  const [configuracoes, setConfiguracoes] = useState([])",
      "  const [configuracoes, setConfiguracoes] = useState([])\n  const [colaboradores, setColaboradores] = useState([])"
    )
    admin = admin.replace(
      "      listenCollection('configuracoes', setConfiguracoes),",
      "      listenCollection('configuracoes', setConfiguracoes),\n      listenCollection('colaboradores', setColaboradores),"
    )
  }

  admin = admin.replace(
    "{tab === 'demandas' && <Demandas data={demandas.filter(item => item.arquivada !== true)} />}",
    "{tab === 'demandas' && <Demandas data={demandas.filter(item => item.arquivada !== true)} colaboradores={colaboradores} />}"
  )

  if (!admin.includes("tab === 'colaboradores'")) {
    admin = admin.replace(
      "{tab === 'arquivadas' && <Arquivadas data={demandas.filter(item => item.arquivada === true)} />}",
      "{tab === 'arquivadas' && <Arquivadas data={demandas.filter(item => item.arquivada === true)} />}\n        {tab === 'colaboradores' && <Colaboradores data={colaboradores} />}"
    )
  }

  admin = admin.replace('function Demandas({ data }) {', 'function Demandas({ data, colaboradores = [] }) {')

  admin = admin.replace(
    "      atualizacaoPublica: item.atualizacaoPublica || ''\n    }",
    "      atualizacaoPublica: item.atualizacaoPublica || '',\n      servidor: item.servidorResponsavel || ''\n    }"
  )

  if (!admin.includes("alert('Selecione o servidor responsável")) {
    admin = admin.replace(
      "  async function saveUpdate(item) {\n    const draft = getDraft(item)",
      "  async function saveUpdate(item) {\n    const draft = getDraft(item)\n    if (!draft.servidor) {\n      window.alert('Selecione o servidor responsável antes de salvar a atualização.')\n      return\n    }"
    )
  }

  admin = admin.replace(
    "      data: new Date().toISOString()\n    }",
    "      data: new Date().toISOString(),\n      servidor: draft.servidor\n    }"
  )

  admin = admin.replace(
    "        atualizacaoPublica: draft.atualizacaoPublica,\n        historicoPublico:",
    "        atualizacaoPublica: draft.atualizacaoPublica,\n        servidorResponsavel: draft.servidor,\n        historicoPublico:"
  )
  admin = admin.replace(
    "        categoria: item.categoria || '',\n        historico:",
    "        categoria: item.categoria || '',\n        servidorResponsavel: draft.servidor,\n        historico:"
  )

  if (!admin.includes('Servidor responsável *')) {
    admin = admin.replace(
      "                <label>\n                  Atualização visível para o cidadão",
      `                <label>\n                  Servidor responsável *\n                  <select\n                    value={draft.servidor || ''}\n                    onChange={e => setDraft(item, 'servidor', e.target.value)}\n                    required\n                  >\n                    <option value=\"\">Escolha o servidor</option>\n                    {colaboradores.map(colaborador => (\n                      <option key={colaborador.id} value={colaborador.nome}>{colaborador.nome}</option>\n                    ))}\n                  </select>\n                </label>\n\n                <label>\n                  Atualização visível para o cidadão`
    )
  }

  if (!admin.includes('function Colaboradores({ data })')) {
    const component = `\nfunction Colaboradores({ data }) {\n  const [nome, setNome] = useState('')\n  const [message, setMessage] = useState('')\n\n  async function submit(e) {\n    e.preventDefault()\n    const clean = nome.trim()\n    if (!clean) return\n    if (data.some(item => (item.nome || '').toLowerCase() === clean.toLowerCase())) {\n      setMessage('Esse colaborador já está cadastrado.')\n      return\n    }\n    await createDocument('colaboradores', { nome: clean, ativo: true, criadoEm: new Date().toISOString() })\n    setNome('')\n    setMessage('Colaborador cadastrado com sucesso.')\n  }\n\n  async function remove(item) {\n    if (!window.confirm(\`Remover \${item.nome} da lista de colaboradores?\`)) return\n    await removeDocument('colaboradores', item.id)\n  }\n\n  return (\n    <section className=\"admin-panel\">\n      <div className=\"panel-head\">\n        <div><h2>Colaboradores</h2><p>Cadastre os servidores que podem responder e atualizar demandas.</p></div>\n        <span>{data.length} cadastrado(s)</span>\n      </div>\n      <form className=\"admin-form collaborator-form\" onSubmit={submit}>\n        <input value={nome} onChange={e => setNome(e.target.value)} placeholder=\"Nome do servidor\" />\n        <button className=\"btn btn-primary\" type=\"submit\"><Plus size={16}/> Cadastrar colaborador</button>\n        {message && <div className=\"form-message success-message\">{message}</div>}\n      </form>\n      <div className=\"edit-list collaborator-list\">\n        {data.map(item => (\n          <div key={item.id}>\n            <div><strong>{item.nome}</strong><span>Disponível para responder demandas</span></div>\n            <button type=\"button\" className=\"danger-button\" onClick={() => remove(item)}><Trash2 size={15}/> Remover</button>\n          </div>\n        ))}\n        {!data.length && <p>Nenhum colaborador cadastrado ainda.</p>}\n      </div>\n    </section>\n  )\n}\n\n`
    admin = admin.replace('\nfunction Dashboard(', component + 'function Dashboard(')
  }

  return admin
})

patch('src/pages/Home.jsx', home => {
  if (!home.includes('<span>Respondido por</span>')) {
    home = home.replace(
      "                  <div className=\"tracking-subject\">",
      `                  {trackingResult.servidorResponsavel && (\n                    <div className=\"tracking-subject tracking-responder\">\n                      <span>Respondido por</span>\n                      <strong>{trackingResult.servidorResponsavel}</strong>\n                    </div>\n                  )}\n\n                  <div className=\"tracking-subject\">`
    )
  }

  if (!home.includes("item.servidor && <small className=\"timeline-server\"")) {
    home = home.replace(
      "                          <p>{item.mensagem || 'Status atualizado pelo gabinete.'}</p>\n                          {item.data && <small>{new Date(item.data).toLocaleString('pt-BR')}</small>}",
      "                          <p>{item.mensagem || 'Status atualizado pelo gabinete.'}</p>\n                          {item.servidor && <small className=\"timeline-server\">Respondido por: <strong>{item.servidor}</strong></small>}\n                          {item.data && <small>{new Date(item.data).toLocaleString('pt-BR')}</small>}"
    )
  }
  return home
})
