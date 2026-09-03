import fs from 'node:fs'

const adminPath = 'src/pages/Admin.jsx'
const adminCssPath = 'src/styles/admin.css'

let admin = fs.readFileSync(adminPath, 'utf8')
const startMarker = 'function MandatosAnterioresAdmin({ data }) {'
const start = admin.indexOf(startMarker)

if (start !== -1 && !admin.includes('MANDATOS_ADMIN_ORGANIZADO')) {
  const nextFunction = admin.indexOf('\nfunction ', start + startMarker.length)
  if (nextFunction !== -1) {
    const component = String.raw`function MandatosAnterioresAdmin({ data }) {
  /* MANDATOS_ADMIN_ORGANIZADO */
  const [selectedMandato, setSelectedMandato] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('')
  const [mandatoForm, setMandatoForm] = useState({ inicio:'', fim:'', descricaoMandato:'' })
  const [categoriaNome, setCategoriaNome] = useState('')
  const [registro, setRegistro] = useState({ numero:'', titulo:'', data:'', local:'', status:'', descricao:'', linkDocumento:'', imagemUrl:'', imagemFileId:'' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [progress, setProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const registros = data.filter(item => !item._kind || item._kind === 'registro')
  const mandatosMeta = data.filter(item => item._kind === 'mandato')

  const mandatos = useMemo(() => {
    const mapa = new Map()
    mandatosMeta.forEach(item => mapa.set(item.mandato, item))
    registros.forEach(item => {
      const nome = item.mandato || item.periodo
      if (nome && !mapa.has(nome)) mapa.set(nome, { id:'legacy-' + nome, mandato:nome, descricaoMandato:'' })
    })
    return [...mapa.values()].sort((a,b) => String(b.mandato).localeCompare(String(a.mandato)))
  }, [data])

  const categorias = useMemo(() => {
    if (!selectedMandato) return []
    const nomes = new Set()
    data.filter(item => item._kind === 'categoria' && item.mandato === selectedMandato).forEach(item => nomes.add(item.tipo))
    registros.filter(item => (item.mandato || item.periodo) === selectedMandato).forEach(item => nomes.add(item.tipo || 'Outros'))
    return [...nomes].sort((a,b) => a.localeCompare(b))
  }, [data, selectedMandato])

  const registrosCategoria = registros.filter(item =>
    (item.mandato || item.periodo) === selectedMandato &&
    (item.tipo || 'Outros') === selectedCategoria
  )

  async function criarMandato(e) {
    e.preventDefault()
    setError('')
    if (!mandatoForm.inicio || !mandatoForm.fim) return setError('Informe o ano inicial e o ano final do mandato.')
    const nome = mandatoForm.inicio + '–' + mandatoForm.fim
    if (mandatos.some(item => item.mandato === nome)) return setError('Esse mandato já existe.')
    await createDocument('mandatos_anteriores', {
      _kind:'mandato',
      mandato:nome,
      periodo:nome,
      descricaoMandato:mandatoForm.descricaoMandato || ''
    })
    setMandatoForm({ inicio:'', fim:'', descricaoMandato:'' })
    setSelectedMandato(nome)
    setSelectedCategoria('')
  }

  async function criarCategoria(e) {
    e.preventDefault()
    setError('')
    const nome = categoriaNome.trim()
    if (!selectedMandato) return setError('Primeiro selecione um mandato.')
    if (!nome) return setError('Digite o nome da subpasta/categoria.')
    if (categorias.includes(nome)) return setError('Essa categoria já existe neste mandato.')
    await createDocument('mandatos_anteriores', {
      _kind:'categoria',
      mandato:selectedMandato,
      periodo:selectedMandato,
      tipo:nome
    })
    setCategoriaNome('')
    setSelectedCategoria(nome)
  }

  function escolherImagem(e) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) return setError('Escolha um arquivo de imagem.')
    if (f.size > 10 * 1024 * 1024) return setError('A imagem deve ter no máximo 10 MB.')
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError('')
  }

  async function criarRegistro(e) {
    e.preventDefault()
    setError('')
    if (!selectedMandato || !selectedCategoria) return setError('Selecione o mandato e a subpasta antes de cadastrar o registro.')
    if (!registro.titulo) return setError('Informe o título/assunto do registro.')
    setSaving(true)
    try {
      let payload = {
        ...registro,
        _kind:'registro',
        mandato:selectedMandato,
        periodo:selectedMandato,
        tipo:selectedCategoria
      }
      if (file) {
        const result = await uploadPanelImage(file, '/site-andreia/mandatos-anteriores', setProgress)
        payload.imagemUrl = result.url
        payload.imagemFileId = result.fileId || ''
      }
      await createDocument('mandatos_anteriores', payload)
      setRegistro({ numero:'', titulo:'', data:'', local:'', status:'', descricao:'', linkDocumento:'', imagemUrl:'', imagemFileId:'' })
      setFile(null)
      setPreview('')
      setProgress(0)
    } catch (err) {
      console.error(err)
      setError('Não foi possível salvar este registro.')
    } finally {
      setSaving(false)
    }
  }

  async function excluirMandato(mandato) {
    const relacionados = data.filter(item => (item.mandato || item.periodo) === mandato)
    if (!window.confirm('Excluir o mandato ' + mandato + ' e todos os registros e subpastas dentro dele?')) return
    for (const item of relacionados) await removeDocument('mandatos_anteriores', item.id)
    setSelectedMandato('')
    setSelectedCategoria('')
  }

  async function excluirCategoria(tipo) {
    const relacionados = data.filter(item => (item.mandato || item.periodo) === selectedMandato && item.tipo === tipo)
    if (!window.confirm('Excluir a subpasta ' + tipo + ' e todos os registros dentro dela?')) return
    for (const item of relacionados) await removeDocument('mandatos_anteriores', item.id)
    setSelectedCategoria('')
  }

  const mandatoAtual = mandatos.find(item => item.mandato === selectedMandato)

  return (
    <section className="admin-panel mandates-manager">
      <div className="panel-head">
        <div>
          <h2>Mandatos anteriores</h2>
          <p>Organize a memória do mandato como pastas: mandato → subpasta → registros.</p>
        </div>
      </div>

      <div className="mandates-steps">
        <span className={!selectedMandato ? 'active' : 'done'}>1. Mandato</span>
        <span className={selectedMandato && !selectedCategoria ? 'active' : selectedCategoria ? 'done' : ''}>2. Subpasta</span>
        <span className={selectedCategoria ? 'active' : ''}>3. Registros</span>
      </div>

      {!selectedMandato && (
        <>
          <div className="mandates-create-box">
            <h3>Criar novo mandato</h3>
            <p>Cadastre o período uma única vez. Depois você organiza tudo dentro dele.</p>
            <form className="admin-form mandate-period-form" onSubmit={criarMandato}>
              <input inputMode="numeric" placeholder="Ano inicial (ex.: 2021)" value={mandatoForm.inicio} onChange={e=>setMandatoForm({...mandatoForm,inicio:e.target.value})}/>
              <input inputMode="numeric" placeholder="Ano final (ex.: 2024)" value={mandatoForm.fim} onChange={e=>setMandatoForm({...mandatoForm,fim:e.target.value})}/>
              <textarea placeholder="Descrição geral deste mandato" value={mandatoForm.descricaoMandato} onChange={e=>setMandatoForm({...mandatoForm,descricaoMandato:e.target.value})}/>
              <button className="btn btn-primary"><Plus size={16}/> Criar pasta do mandato</button>
            </form>
          </div>

          <div className="mandate-folder-grid admin-mandate-folders">
            {mandatos.map(item => {
              const quantidade = registros.filter(reg => (reg.mandato || reg.periodo) === item.mandato).length
              return (
                <button type="button" className="admin-mandate-folder" key={item.mandato} onClick={()=>setSelectedMandato(item.mandato)}>
                  <span>PASTA DO MANDATO</span>
                  <strong>{item.mandato}</strong>
                  <small>{quantidade} registro(s)</small>
                  {item.descricaoMandato && <p>{item.descricaoMandato}</p>}
                  <b>Abrir pasta →</b>
                </button>
              )
            })}
            {!mandatos.length && <p>Nenhum mandato criado ainda.</p>}
          </div>
        </>
      )}

      {selectedMandato && !selectedCategoria && (
        <>
          <div className="mandates-breadcrumb">
            <button type="button" onClick={()=>setSelectedMandato('')}>← Todos os mandatos</button>
            <strong>{selectedMandato}</strong>
          </div>

          <div className="mandate-current-head">
            <div><span>MANDATO SELECIONADO</span><h3>{selectedMandato}</h3><p>{mandatoAtual?.descricaoMandato || 'Sem descrição geral cadastrada.'}</p></div>
            <button type="button" className="danger-button" onClick={()=>excluirMandato(selectedMandato)}><Trash2 size={15}/> Excluir mandato</button>
          </div>

          <div className="mandates-create-box">
            <h3>Criar subpasta</h3>
            <p>Exemplos: Requerimentos, Moções, Projetos de Lei, Ações, Indicações, Visitas.</p>
            <form className="admin-form mandate-category-form" onSubmit={criarCategoria}>
              <input placeholder="Nome da subpasta" value={categoriaNome} onChange={e=>setCategoriaNome(e.target.value)}/>
              <button className="btn btn-primary"><Plus size={16}/> Criar subpasta</button>
            </form>
          </div>

          <div className="mandate-category-grid">
            {categorias.map(tipo => {
              const quantidade = registros.filter(reg => (reg.mandato || reg.periodo) === selectedMandato && (reg.tipo || 'Outros') === tipo).length
              return <button type="button" className="admin-mandate-category" key={tipo} onClick={()=>setSelectedCategoria(tipo)}><span>SUBPASTA</span><strong>{tipo}</strong><small>{quantidade} registro(s)</small><b>Abrir →</b></button>
            })}
            {!categorias.length && <p>Crie a primeira subpasta deste mandato.</p>}
          </div>
        </>
      )}

      {selectedMandato && selectedCategoria && (
        <>
          <div className="mandates-breadcrumb">
            <button type="button" onClick={()=>{setSelectedCategoria(''); setFile(null); setPreview('')}}>← Subpastas</button>
            <span>{selectedMandato}</span><strong>{selectedCategoria}</strong>
          </div>

          <div className="mandate-current-head">
            <div><span>SUBPASTA</span><h3>{selectedCategoria}</h3><p>Cadastre abaixo todos os registros desta categoria.</p></div>
            <button type="button" className="danger-button" onClick={()=>excluirCategoria(selectedCategoria)}><Trash2 size={15}/> Excluir subpasta</button>
          </div>

          <form className="admin-form mandate-record-form" onSubmit={criarRegistro}>
            <input placeholder="Número / protocolo" value={registro.numero} onChange={e=>setRegistro({...registro,numero:e.target.value})}/>
            <input placeholder="Título / assunto" value={registro.titulo} onChange={e=>setRegistro({...registro,titulo:e.target.value})}/>
            <input type="date" value={registro.data} onChange={e=>setRegistro({...registro,data:e.target.value})}/>
            <input placeholder="Local (opcional)" value={registro.local} onChange={e=>setRegistro({...registro,local:e.target.value})}/>
            <select value={registro.status} onChange={e=>setRegistro({...registro,status:e.target.value})}>
              <option value="">Situação / status</option>
              <option>Apresentado</option><option>Em tramitação</option><option>Aprovado</option><option>Atendido</option><option>Arquivado</option>
            </select>
            <input placeholder="Link do documento (opcional)" value={registro.linkDocumento} onChange={e=>setRegistro({...registro,linkDocumento:e.target.value})}/>
            <textarea placeholder="Descrição completa" value={registro.descricao} onChange={e=>setRegistro({...registro,descricao:e.target.value})}/>
            <label className="image-upload-label">Imagem (opcional)<input type="file" accept="image/*" onChange={escolherImagem}/></label>
            {preview && <img className="news-upload-preview" src={preview} alt="Prévia do registro"/>}
            {saving && file && <div className="upload-progress"><div style={{width:progress + '%'}}/><span>{progress}%</span></div>}
            {error && <div className="form-message error-message">{error}</div>}
            <button className="btn btn-primary" disabled={saving}><Plus size={16}/>{saving ? ' Salvando...' : ' Cadastrar registro nesta subpasta'}</button>
          </form>

          <div className="admin-detailed-list mandate-record-admin-list">
            {registrosCategoria.map(item => (
              <div className="admin-detailed-row" key={item.id}>
                <div className="admin-detail-open">
                  <strong>{item.numero ? 'Nº ' + item.numero + ' — ' : ''}{item.titulo || 'Registro'}</strong>
                  <span>{item.data || 'Sem data'} · {item.status || 'Sem status'}</span>
                  {item.descricao && <small>{item.descricao}</small>}
                </div>
                <button className="danger-button" type="button" onClick={()=>removeDocument('mandatos_anteriores', item.id)}><Trash2 size={15}/> Excluir</button>
              </div>
            ))}
            {!registrosCategoria.length && <p>Nenhum registro cadastrado nesta subpasta.</p>}
          </div>
        </>
      )}

      {error && !selectedCategoria && <div className="form-message error-message">{error}</div>}
    </section>
  )
}
`

    admin = admin.slice(0, start) + component + admin.slice(nextFunction)
    fs.writeFileSync(adminPath, admin)
  }
}

let css = fs.readFileSync(adminCssPath, 'utf8')
if (!css.includes('/* MANDATOS_ADMIN_ORGANIZADO */')) {
  css += String.raw`

/* MANDATOS_ADMIN_ORGANIZADO */
.admin-sidebar{position:sticky!important;top:0!important;height:100dvh!important;max-height:100dvh!important;overflow-y:auto!important;overflow-x:hidden!important;align-self:start!important;overscroll-behavior:contain!important;scrollbar-gutter:stable!important;padding-bottom:28px!important}
.admin-sidebar nav{padding-bottom:8px!important}
.admin-logout{position:static!important;margin-top:18px!important}
.mandates-manager{overflow:visible!important}.mandates-steps{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}.mandates-steps span{padding:9px 13px;border-radius:999px;background:#eee8f3;color:#74657f;font-size:11px;font-weight:900}.mandates-steps span.active{background:#5421a6;color:#fff}.mandates-steps span.done{background:#e9ddf7;color:#5421a6}.mandates-create-box{background:#f8f5fb;border:1px solid #e5dceb;border-radius:14px;padding:18px;margin-bottom:18px}.mandates-create-box h3{margin:0 0 5px;color:#321947}.mandates-create-box p{margin:0 0 14px;color:#756d7d;font-size:12px}.mandate-period-form{grid-template-columns:repeat(2,minmax(0,1fr))}.mandate-period-form textarea,.mandate-period-form button{grid-column:1/-1}.admin-mandate-folders,.mandate-category-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}.admin-mandate-folder,.admin-mandate-category{border:1px solid #ded4e7;background:#fff;border-radius:16px;padding:20px;text-align:left;display:grid;gap:7px;cursor:pointer;min-height:150px;box-shadow:0 6px 18px rgba(53,16,111,.04)}.admin-mandate-folder:hover,.admin-mandate-category:hover{border-color:#bda7d5;transform:translateY(-1px)}.admin-mandate-folder span,.admin-mandate-category span,.mandate-current-head span{font-size:9px;letter-spacing:.9px;font-weight:900;color:#745894}.admin-mandate-folder strong{font-size:25px;color:#321947}.admin-mandate-category strong{font-size:18px;color:#321947}.admin-mandate-folder small,.admin-mandate-category small{color:#7a7180}.admin-mandate-folder p{font-size:11px;line-height:1.5;color:#6d6374;margin:2px 0}.admin-mandate-folder b,.admin-mandate-category b{margin-top:auto;color:#5421a6;font-size:11px}.mandates-breadcrumb{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;padding:10px 0}.mandates-breadcrumb button{border:0;background:transparent;color:#5421a6;font-weight:900;cursor:pointer}.mandates-breadcrumb span{color:#81768a}.mandates-breadcrumb strong{color:#321947}.mandate-current-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;background:#fff;border:1px solid #e5ddec;border-radius:14px;padding:18px;margin-bottom:18px}.mandate-current-head h3{font-size:24px;margin:4px 0 7px;color:#321947}.mandate-current-head p{margin:0;color:#746b7b;line-height:1.6}.mandate-category-form{grid-template-columns:minmax(0,1fr) auto;align-items:center}.mandate-record-form{grid-template-columns:repeat(2,minmax(0,1fr))}.mandate-record-form textarea,.mandate-record-form .image-upload-label,.mandate-record-form .news-upload-preview,.mandate-record-form .upload-progress,.mandate-record-form .form-message,.mandate-record-form button{grid-column:1/-1}.mandate-record-admin-list{margin-top:18px}
@media(max-width:980px){.admin-sidebar{position:relative!important;top:auto!important;height:auto!important;max-height:none!important;overflow:visible!important}.admin-sidebar nav{max-height:none!important;overflow:visible!important}}
@media(max-width:640px){.mandate-period-form,.mandate-record-form,.mandate-category-form{grid-template-columns:1fr}.mandate-period-form textarea,.mandate-period-form button,.mandate-record-form textarea,.mandate-record-form .image-upload-label,.mandate-record-form .news-upload-preview,.mandate-record-form .upload-progress,.mandate-record-form .form-message,.mandate-record-form button{grid-column:auto}.mandate-current-head{flex-direction:column}.admin-mandate-folders,.mandate-category-grid{grid-template-columns:1fr}}
`
  fs.writeFileSync(adminCssPath, css)
}

console.log('[mandatos-admin] painel organizado em mandato > subpasta > registros; sidebar com rolagem corrigida.')
