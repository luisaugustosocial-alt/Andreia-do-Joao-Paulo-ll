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
