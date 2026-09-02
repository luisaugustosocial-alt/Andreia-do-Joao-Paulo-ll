import fs from 'node:fs'

function patch(path, fn){
  if(!fs.existsSync(path)) return
  const original=fs.readFileSync(path,'utf8')
  const next=fn(original)
  fs.writeFileSync(path,next,'utf8')
}

patch('src/pages/Home.jsx', home => {
  if(!home.includes('const [configuracoes, setConfiguracoes]')){
    home=home.replace("  const [acoes, setAcoes] = useState([])","  const [acoes, setAcoes] = useState([])\n  const [configuracoes, setConfiguracoes] = useState([])")
    home=home.replace("      listenCollection('acoes', setAcoes),","      listenCollection('acoes', setAcoes),\n      listenCollection('configuracoes', setConfiguracoes),")
  }

  if(!home.includes('const [selectedSessao, setSelectedSessao]')){
    home=home.replace(
      "  const [selectedProposicao, setSelectedProposicao] = useState(null)",
      "  const [selectedProposicao, setSelectedProposicao] = useState(null)\n  const [selectedSessao, setSelectedSessao] = useState(null)"
    )
  }

  if(!home.includes('function formatDateBR(value)')){
    home=home.replace('  const stats = useMemo(() => {',`  const config = configuracoes[0] || {}\n\n  function formatDateBR(value) {\n    if (!value) return ''\n    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) {\n      const [ano, mes, dia] = value.split('-')\n      return \`\${dia}/\${mes}/\${ano}\`\n    }\n    return value\n  }\n\n  const stats = useMemo(() => {`)
  }

  home=home.replace("const protocolo = `AND-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`","const protocolo = `AND-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`")
  home=home.replace('\n              <div className="hero-shape"></div>','')
  home=home.replace('<p>Andreia do João Paulo II construiu sua trajetória com forte presença comunitária, escuta ativa e compromisso com as pessoas.</p>\n              <p>Seu mandato tem como prioridade aproximar a política da população, defender direitos e buscar soluções concretas para Bom Jesus da Lapa.</p>\n              <blockquote>“Política se faz ouvindo, estando presente e trabalhando por quem mais precisa.”</blockquote>',`<p>{config.sobre1 || 'Andreia do João Paulo II construiu sua trajetória com forte presença comunitária, escuta ativa e compromisso com as pessoas.'}</p>\n              <p>{config.sobre2 || 'Seu mandato tem como prioridade aproximar a política da população, defender direitos e buscar soluções concretas para Bom Jesus da Lapa.'}</p>\n              <blockquote>{config.frase || '“Política se faz ouvindo, estando presente e trabalhando por quem mais precisa.”'}</blockquote>`)
  home=home.replaceAll("{sessao.data || 'Data não informada'}","{formatDateBR(sessao.data) || 'Data não informada'}")
  home=home.replaceAll("{item.data || 'AGENDA'}","{formatDateBR(item.data) || 'AGENDA'}")
  home=home.replaceAll("{selectedAgenda.data || 'Não informada'}","{formatDateBR(selectedAgenda.data) || 'Não informada'}")
  home=home.replaceAll("<span>{item.data || ''}</span>","<span>{formatDateBR(item.data) || ''}</span>")
  home=home.replaceAll("{selectedNews.data || ''}","{formatDateBR(selectedNews.data) || ''}")

  if(!home.includes('liquid-status-button')){
    const oldStatus=`                    <b className={\`status \${sessao.status === 'Presente' ? 'present' : 'absent'}\`}>\n                      {sessao.status}\n                    </b>`
    const newStatus=`                    <button\n                      type="button"\n                      className={\`status liquid-status-button \${sessao.status === 'Presente' ? 'present' : 'absent'}\`}\n                      onClick={() => setSelectedSessao(sessao)}\n                      aria-label={\`Ver detalhes da sessão: \${sessao.status}\`}\n                    >\n                      {sessao.status}\n                    </button>`
    home=home.replace(oldStatus,newStatus)
  }

  if(!home.includes('DETALHES DA SESSÃO')){
    const anchor=`                {!sessoes.length && <p>Nenhuma sessão cadastrada ainda.</p>}\n              </div>\n            </div>`
    const modal=`                {!sessoes.length && <p>Nenhuma sessão cadastrada ainda.</p>}\n              </div>\n            </div>\n\n            {selectedSessao && (\n              <div className="liquid-modal-backdrop" onClick={() => setSelectedSessao(null)}>\n                <article\n                  className="liquid-modal-card session-liquid-modal"\n                  onClick={e => e.stopPropagation()}\n                  role="dialog"\n                  aria-modal="true"\n                  aria-label="Detalhes da sessão"\n                >\n                  <button\n                    type="button"\n                    className="liquid-modal-close"\n                    onClick={() => setSelectedSessao(null)}\n                    aria-label="Fechar detalhes"\n                  >×</button>\n\n                  <span className="section-kicker">DETALHES DA SESSÃO</span>\n                  <h3>{selectedSessao.tipo || 'Sessão da Câmara Municipal'}</h3>\n\n                  <div className="liquid-detail-grid">\n                    <div>\n                      <span>Data</span>\n                      <strong>{formatDateBR(selectedSessao.data) || 'Não informada'}</strong>\n                    </div>\n                    <div>\n                      <span>Tipo da sessão</span>\n                      <strong>{selectedSessao.tipo || 'Não informado'}</strong>\n                    </div>\n                    <div>\n                      <span>Participação</span>\n                      <strong>{selectedSessao.status || 'Não informada'}</strong>\n                    </div>\n                    {selectedSessao.justificativa && (\n                      <div className="liquid-detail-full">\n                        <span>Motivo / justificativa</span>\n                        <p>{selectedSessao.justificativa}</p>\n                      </div>\n                    )}\n                    {!selectedSessao.justificativa && selectedSessao.status !== 'Presente' && (\n                      <div className="liquid-detail-full">\n                        <span>Motivo / justificativa</span>\n                        <p>Nenhuma justificativa foi cadastrada para esta sessão.</p>\n                      </div>\n                    )}\n                  </div>\n                </article>\n              </div>\n            )}`
    home=home.replace(anchor,modal)
  }

  if(!home.includes('liquid-tracking-close')){
    home=home.replace(
      '<div className="tracking-result">',
      `<div className="tracking-result">\n                  <button\n                    type="button"\n                    className="liquid-modal-close liquid-tracking-close"\n                    onClick={() => setTrackingResult(null)}\n                    aria-label="Fechar resultado do protocolo"\n                  >×</button>`
    )
  }

  return home
})

patch('src/pages/Admin.jsx', admin => {
  admin=admin.replaceAll('AND-2026-123456','AND-2026-123')
  if(!admin.includes('function formatSimpleDate(value)')){
    admin=admin.replace('\nfunction Dashboard(',`\nfunction formatSimpleDate(value) {\n  if (!value) return ''\n  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) {\n    const [ano, mes, dia] = value.split('-')\n    return \`\${dia}/\${mes}/\${ano}\`\n  }\n  return value\n}\n\nfunction Dashboard(`)
  }
  admin=admin.replaceAll('{item.data} · {item.horario} · {item.local}','{formatSimpleDate(item.data)} · {item.horario} · {item.local}')
  admin=admin.replace("email: current.email || ''","email: current.email || '',\n    sobre1: current.sobre1 || '',\n    sobre2: current.sobre2 || '',\n    frase: current.frase || ''")
  const emailInput='<input placeholder="E-mail institucional" value={form.email} onChange={e => setForm({...form,email:e.target.value})} />'
  if(admin.includes(emailInput) && !admin.includes('História da Andreia - parágrafo 1')){
    admin=admin.replace(emailInput,emailInput+`\n        <textarea placeholder="História da Andreia - parágrafo 1" value={form.sobre1} onChange={e => setForm({...form,sobre1:e.target.value})} />\n        <textarea placeholder="História da Andreia - parágrafo 2" value={form.sobre2} onChange={e => setForm({...form,sobre2:e.target.value})} />\n        <textarea placeholder="Frase de destaque da Andreia" value={form.frase} onChange={e => setForm({...form,frase:e.target.value})} />`)
  }
  return admin
})

patch('src/pages/Admin.jsx', admin => {
  const agendaStart = admin.indexOf('function Agenda({ data }) {')
  const agendaEnd = admin.indexOf('function Noticias({ data }) {', agendaStart)
  if (agendaStart !== -1 && agendaEnd !== -1) {
    const agendaReplacement = `function Agenda({ data }) {
  const emptyForm = { titulo:'', data:'', horario:'', local:'', descricao:'' }
  const [form, setForm] = useState(emptyForm)
  const [selected, setSelected] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function startEdit(item) {
    setEditingId(item.id)
    setForm({
      titulo: item.titulo || '',
      data: item.data || '',
      horario: item.horario || '',
      local: item.local || '',
      descricao: item.descricao || ''
    })
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.titulo || !form.data) return
    if (editingId) {
      await updateDocument('agenda', editingId, form)
      setMessage('Compromisso atualizado com sucesso.')
    } else {
      await createDocument('agenda', form)
      setMessage('Compromisso adicionado com sucesso.')
    }
    resetForm()
  }

  async function deleteItem(item) {
    if (!window.confirm('Excluir este compromisso?')) return
    await removeDocument('agenda', item.id)
    if (editingId === item.id) resetForm()
    if (selected?.id === item.id) setSelected(null)
  }

  return (
    <CrudSection title={editingId ? 'Editar compromisso da agenda' : 'Agenda do mandato'} form={
      <form className="admin-form" onSubmit={submit}>
        {editingId && (
          <div className="edit-mode-banner">
            <div><strong>Editando compromisso publicado</strong><span>Altere os dados e salve.</span></div>
            <button type="button" className="btn btn-outline" onClick={resetForm}>Cancelar edição</button>
          </div>
        )}
        <input placeholder="Título" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/>
        <input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})}/>
        <input type="time" value={form.horario} onChange={e=>setForm({...form,horario:e.target.value})}/>
        <input placeholder="Local" value={form.local} onChange={e=>setForm({...form,local:e.target.value})}/>
        <textarea placeholder="Descrição detalhada do compromisso" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/>
        <button className="btn btn-primary"><Check size={16}/>{editingId ? 'Salvar alterações' : 'Adicionar compromisso'}</button>
        {message && <div className="form-message success-message">{message}</div>}
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
            <div className="news-admin-actions">
              <button className="edit-news-button" type="button" onClick={() => startEdit(item)}>Editar</button>
              <button className="danger-button" type="button" onClick={() => deleteItem(item)}><Trash2 size={15}/> Excluir</button>
            </div>
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

`
    admin = admin.slice(0, agendaStart) + agendaReplacement + admin.slice(agendaEnd)
  }

  const transparenciaStart = admin.indexOf('function Transparencia({ sessoes, acoes }) {')
  const transparenciaEnd = admin.indexOf('function CrudSection({ title, form, children }) {', transparenciaStart)
  if (transparenciaStart !== -1 && transparenciaEnd !== -1) {
    const transparenciaReplacement = `function Transparencia({ sessoes, acoes }) {
  const emptySessao = { data:'', tipo:'Sessão Ordinária', status:'Presente', justificativa:'' }
  const emptyAcao = { titulo:'', bairro:'', data:'' }
  const [sessao, setSessao] = useState(emptySessao)
  const [acao, setAcao] = useState(emptyAcao)
  const [editingSessaoId, setEditingSessaoId] = useState(null)
  const [editingAcaoId, setEditingAcaoId] = useState(null)

  function editSessao(item) {
    setEditingSessaoId(item.id)
    setSessao({
      data: item.data || '',
      tipo: item.tipo || 'Sessão Ordinária',
      status: item.status || 'Presente',
      justificativa: item.justificativa || ''
    })
  }

  function editAcao(item) {
    setEditingAcaoId(item.id)
    setAcao({ titulo:item.titulo || '', bairro:item.bairro || '', data:item.data || '' })
  }

  async function saveSessao(e) {
    e.preventDefault()
    if (!sessao.data) return
    if (editingSessaoId) await updateDocument('sessoes', editingSessaoId, sessao)
    else await createDocument('sessoes', sessao)
    setSessao(emptySessao)
    setEditingSessaoId(null)
  }

  async function saveAcao(e) {
    e.preventDefault()
    if (!acao.titulo || !acao.bairro) return
    if (editingAcaoId) await updateDocument('acoes', editingAcaoId, acao)
    else await createDocument('acoes', acao)
    setAcao(emptyAcao)
    setEditingAcaoId(null)
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
          <div className="panel-head"><h2>{editingSessaoId ? 'Editar sessão' : 'Registrar sessão'}</h2></div>
          <form className="admin-form" onSubmit={saveSessao}>
            {editingSessaoId && <button type="button" className="btn btn-outline" onClick={() => { setEditingSessaoId(null); setSessao(emptySessao) }}>Cancelar edição</button>}
            <input type="date" value={sessao.data} onChange={e=>setSessao({...sessao,data:e.target.value})}/>
            <select value={sessao.tipo} onChange={e=>setSessao({...sessao,tipo:e.target.value})}>
              <option>Sessão Ordinária</option><option>Sessão Extraordinária</option><option>Sessão Solene</option>
            </select>
            <select value={sessao.status} onChange={e=>setSessao({...sessao,status:e.target.value})}>
              <option>Presente</option><option>Ausente</option><option>Ausência justificada</option>
            </select>
            <input placeholder="Justificativa, se houver" value={sessao.justificativa} onChange={e=>setSessao({...sessao,justificativa:e.target.value})}/>
            <button className="btn btn-primary"><Check size={16}/>{editingSessaoId ? 'Salvar alterações' : 'Salvar sessão'}</button>
          </form>
          <div className="edit-list">
            {sessoes.map(item => (
              <div key={item.id}>
                <div><strong>{item.tipo || 'Sessão'}</strong><span>{item.data} · {item.status}{item.justificativa ? ' · ' + item.justificativa : ''}</span></div>
                <div>
                  <button type="button" onClick={() => editSessao(item)}>Editar</button>
                  <button className="danger-button" type="button" onClick={() => removeDocument('sessoes', item.id)}><Trash2 size={15}/> Excluir</button>
                </div>
              </div>
            ))}
            {!sessoes.length && <p>Nenhuma sessão cadastrada.</p>}
          </div>
        </section>

        <section className="admin-panel">
          <div className="panel-head"><h2>{editingAcaoId ? 'Editar ação/comunidade' : 'Registrar ação/comunidade'}</h2></div>
          <form className="admin-form" onSubmit={saveAcao}>
            {editingAcaoId && <button type="button" className="btn btn-outline" onClick={() => { setEditingAcaoId(null); setAcao(emptyAcao) }}>Cancelar edição</button>}
            <input placeholder="Ação realizada" value={acao.titulo} onChange={e=>setAcao({...acao,titulo:e.target.value})}/>
            <input placeholder="Bairro / Comunidade" value={acao.bairro} onChange={e=>setAcao({...acao,bairro:e.target.value})}/>
            <input type="date" value={acao.data} onChange={e=>setAcao({...acao,data:e.target.value})}/>
            <button className="btn btn-primary"><Check size={16}/>{editingAcaoId ? 'Salvar alterações' : 'Registrar ação'}</button>
          </form>
          <div className="edit-list">
            {acoes.map(item => (
              <div key={item.id}>
                <div><strong>{item.titulo || 'Ação'}</strong><span>{item.bairro} · {item.data || ''}</span></div>
                <div>
                  <button type="button" onClick={() => editAcao(item)}>Editar</button>
                  <button className="danger-button" type="button" onClick={() => removeDocument('acoes', item.id)}><Trash2 size={15}/> Excluir</button>
                </div>
              </div>
            ))}
            {!acoes.length && <p>Nenhuma ação cadastrada.</p>}
          </div>
        </section>
      </div>
    </>
  )
}

`
    admin = admin.slice(0, transparenciaStart) + transparenciaReplacement + admin.slice(transparenciaEnd)
  }

  return admin
})
