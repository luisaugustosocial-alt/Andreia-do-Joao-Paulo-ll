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

  if (!admin.includes('const colaboradores = useMemo')) {
    admin = admin.replace(
      "  const navigate = useNavigate()",
      "  const navigate = useNavigate()\n  const colaboradores = useMemo(() => {\n    const lista = configuracoes[0]?.colaboradores\n    return Array.isArray(lista) ? lista.filter(item => item && item.ativo !== false) : []\n  }, [configuracoes])"
    )
  }

  admin = admin.replace(
    "{tab === 'demandas' && <Demandas data={demandas.filter(item => item.arquivada !== true)} />}",
    "{tab === 'demandas' && <Demandas data={demandas.filter(item => item.arquivada !== true)} colaboradores={colaboradores} />}"
  )

  if (!admin.includes("tab === 'colaboradores'")) {
    admin = admin.replace(
      "{tab === 'arquivadas' && <Arquivadas data={demandas.filter(item => item.arquivada === true)} />}",
      "{tab === 'arquivadas' && <Arquivadas data={demandas.filter(item => item.arquivada === true)} />}\n        {tab === 'colaboradores' && <Colaboradores data={colaboradores} config={configuracoes[0] || null} />}"
    )
  }

  admin = admin.replace('function Demandas({ data }) {', 'function Demandas({ data, colaboradores = [] }) {')

  admin = admin.replace(
    "      atualizacaoPublica: item.atualizacaoPublica || ''\n    }",
    "      atualizacaoPublica: item.atualizacaoPublica || '',\n      servidor: item.servidorResponsavel || ''\n    }"
  )

  if (!admin.includes("Selecione o servidor responsável antes de salvar")) {
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
      `                <label>\n                  Servidor responsável *\n                  <select\n                    value={draft.servidor || ''}\n                    onChange={e => setDraft(item, 'servidor', e.target.value)}\n                    required\n                  >\n                    <option value=\"\">Escolha o servidor</option>\n                    {colaboradores.map(colaborador => (\n                      <option key={colaborador.id || colaborador.nome} value={colaborador.nome}>{colaborador.nome}</option>\n                    ))}\n                  </select>\n                </label>\n\n                <label>\n                  Atualização visível para o cidadão`
    )
  }

  if (!admin.includes('function Colaboradores({ data, config })')) {
    const component = `\nfunction Colaboradores({ data, config }) {\n  const [nome, setNome] = useState('')\n  const [message, setMessage] = useState('')\n  const [error, setError] = useState('')\n  const [saving, setSaving] = useState(false)\n\n  async function persist(lista) {\n    if (config?.id) {\n      await updateDocument('configuracoes', config.id, { colaboradores: lista })\n    } else {\n      await createDocument('configuracoes', { colaboradores: lista })\n    }\n  }\n\n  async function submit(e) {\n    e.preventDefault()\n    const clean = nome.trim()\n    if (!clean || saving) return\n\n    setMessage('')\n    setError('')\n\n    if (data.some(item => (item.nome || '').toLowerCase() === clean.toLowerCase())) {\n      setError('Esse colaborador já está cadastrado.')\n      return\n    }\n\n    setSaving(true)\n    try {\n      const novo = {\n        id: \`col-\${Date.now()}\`,\n        nome: clean,\n        ativo: true,\n        criadoEm: new Date().toISOString()\n      }\n      await persist([...data, novo])\n      setNome('')\n      setMessage('Colaborador cadastrado com sucesso.')\n    } catch (err) {\n      console.error('Erro ao cadastrar colaborador:', err)\n      setError('Não foi possível cadastrar o colaborador. Tente novamente.')\n    } finally {\n      setSaving(false)\n    }\n  }\n\n  async function remove(item) {\n    if (!window.confirm(\`Remover \${item.nome} da lista de colaboradores?\`)) return\n    setError('')\n    setMessage('')\n    try {\n      await persist(data.filter(col => (col.id || col.nome) !== (item.id || item.nome)))\n      setMessage('Colaborador removido com sucesso.')\n    } catch (err) {\n      console.error('Erro ao remover colaborador:', err)\n      setError('Não foi possível remover o colaborador.')\n    }\n  }\n\n  return (\n    <section className=\"admin-panel\">\n      <div className=\"panel-head\">\n        <div>\n          <h2>Colaboradores</h2>\n          <p>Cadastre os servidores que podem responder e atualizar demandas.</p>\n        </div>\n        <span>{data.length} cadastrado(s)</span>\n      </div>\n\n      <form className=\"admin-form collaborator-form\" onSubmit={submit}>\n        <input\n          value={nome}\n          onChange={e => setNome(e.target.value)}\n          placeholder=\"Nome do servidor\"\n          required\n        />\n        <button className=\"btn btn-primary\" type=\"submit\" disabled={saving}>\n          <Plus size={16}/> {saving ? 'Cadastrando...' : 'Cadastrar colaborador'}\n        </button>\n        {message && <div className=\"form-message success-message\">{message}</div>}\n        {error && <div className=\"form-message error-message\">{error}</div>}\n      </form>\n\n      <div className=\"edit-list collaborator-list\">\n        {data.map(item => (\n          <div key={item.id || item.nome}>\n            <div>\n              <strong>{item.nome}</strong>\n              <span>Disponível para responder demandas</span>\n            </div>\n            <button type=\"button\" className=\"danger-button\" onClick={() => remove(item)}>\n              <Trash2 size={15}/> Remover\n            </button>\n          </div>\n        ))}\n        {!data.length && <p>Nenhum colaborador cadastrado ainda.</p>}\n      </div>\n    </section>\n  )\n}\n\n`
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

  if (!home.includes('timeline-server')) {
    home = home.replace(
      "                          <p>{item.mensagem || 'Status atualizado pelo gabinete.'}</p>\n                          {item.data && <small>{new Date(item.data).toLocaleString('pt-BR')}</small>}",
      "                          <p>{item.mensagem || 'Status atualizado pelo gabinete.'}</p>\n                          {item.servidor && <small className=\"timeline-server\">Respondido por: <strong>{item.servidor}</strong></small>}\n                          {item.data && <small>{new Date(item.data).toLocaleString('pt-BR')}</small>}"
    )
  }

  return home
})
