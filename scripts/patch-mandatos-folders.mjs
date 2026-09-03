import fs from 'node:fs'

const homePath = 'src/pages/Home.jsx'
const globalCssPath = 'src/styles/global.css'
const overridesPath = 'src/styles/overrides.css'
const headerPath = 'src/components/Header.jsx'

function read(path) { return fs.readFileSync(path, 'utf8') }
function write(path, content) { fs.writeFileSync(path, content) }

let home = read(homePath)

const oldBlockStart = '<div className="previous-terms-grid">'
const oldBlockEnd = '{selectedMandato && ('

if (home.includes(oldBlockStart) && home.includes(oldBlockEnd) && !home.includes('MANDATOS_FOLDER_UI')) {
  const start = home.indexOf(oldBlockStart)
  const end = home.indexOf(oldBlockEnd, start)

  const folderBlock = `<div className="previous-terms-folders" data-ui="MANDATOS_FOLDER_UI">\n              {mandatosAgrupados.map(([mandato, itens]) => {\n                const gruposPorTipo = itens.reduce((grupos, item) => {\n                  const tipo = item.tipo || 'Outros'\n                  if (!grupos[tipo]) grupos[tipo] = []\n                  grupos[tipo].push(item)\n                  return grupos\n                }, {})\n\n                return (\n                  <details className="mandato-folder" key={mandato}>\n                    <summary className="mandato-folder-cover">\n                      <div>\n                        <span className="section-kicker">PASTA DO MANDATO</span>\n                        <strong>{mandato}</strong>\n                        <small>{itens.length} registro(s) arquivado(s)</small>\n                      </div>\n                      <span className="folder-open-label">Abrir pasta</span>\n                    </summary>\n\n                    <div className="mandato-subfolders">\n                      {Object.entries(gruposPorTipo)\n                        .sort((a, b) => a[0].localeCompare(b[0]))\n                        .map(([tipo, registros]) => (\n                          <details className="mandato-subfolder" key={tipo}>\n                            <summary>\n                              <div>\n                                <strong>{tipo}</strong>\n                                <span>{registros.length} registro(s)</span>\n                              </div>\n                              <b>Abrir</b>\n                            </summary>\n\n                            <div className="mandato-record-list">\n                              {registros\n                                .slice()\n                                .sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')))\n                                .map(item => (\n                                  <button\n                                    type="button"\n                                    className="mandato-record"\n                                    key={item.id}\n                                    onClick={() => setSelectedMandato(item)}\n                                  >\n                                    <div>\n                                      <span>{item.numero ? \\`Nº \\${item.numero}\\` : 'Sem número'}</span>\n                                      <strong>{item.titulo || 'Registro do mandato'}</strong>\n                                      <small>{item.data || item.local || 'Data não informada'}</small>\n                                    </div>\n                                    <b>Ver detalhes</b>\n                                  </button>\n                                ))}\n                            </div>\n                          </details>\n                        ))}\n                    </div>\n                  </details>\n                )\n              })}\n              {!mandatosAgrupados.length && <p>Nenhum registro de mandato anterior publicado ainda.</p>}\n            </div>\n\n            `

  home = home.slice(0, start) + folderBlock + home.slice(end)
  write(homePath, home)
}

let css = read(globalCssPath)
if (!css.includes('/* MANDATOS_FOLDER_STYLES */')) {
  css += `\n\n/* MANDATOS_FOLDER_STYLES */\nhtml,body,#root{max-width:100%;overflow-x:hidden}.section,.container,main{max-width:100%}.previous-terms-folders{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px}.mandato-folder{min-width:0}.mandato-folder-cover{list-style:none;cursor:pointer;min-height:210px;border-radius:26px;padding:28px;background:linear-gradient(145deg,#ffffff,#f5eefb);border:1px solid rgba(91,45,123,.12);box-shadow:0 14px 38px rgba(37,16,53,.08);display:flex;align-items:flex-end;justify-content:space-between;gap:18px;position:relative;overflow:hidden}.mandato-folder-cover::-webkit-details-marker,.mandato-subfolder summary::-webkit-details-marker{display:none}.mandato-folder-cover:before{content:"";position:absolute;left:24px;top:0;width:112px;height:22px;border-radius:0 0 14px 14px;background:rgba(91,45,123,.11)}.mandato-folder-cover strong{display:block;font-size:clamp(1.65rem,4vw,2.7rem);line-height:1.05;color:var(--purple-dark,#3d1f53);margin:.35rem 0 .55rem}.mandato-folder-cover small{display:block;color:#6c6172}.folder-open-label{font-weight:800;color:var(--purple,#5b2d7b);white-space:nowrap}.mandato-folder[open] .folder-open-label{font-size:0}.mandato-folder[open] .folder-open-label:after{content:"Fechar pasta";font-size:.9rem}.mandato-subfolders{display:grid;gap:13px;margin-top:14px}.mandato-subfolder{border:1px solid rgba(91,45,123,.12);border-radius:20px;background:#fff;overflow:hidden}.mandato-subfolder>summary{list-style:none;cursor:pointer;padding:18px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:#faf7fc}.mandato-subfolder>summary div{display:grid;gap:3px}.mandato-subfolder>summary strong{font-size:1rem;color:#33243f}.mandato-subfolder>summary span{font-size:.82rem;color:#786c80}.mandato-subfolder>summary b{font-size:.8rem;color:var(--purple,#5b2d7b)}.mandato-record-list{display:grid;gap:9px;padding:12px}.mandato-record{width:100%;border:1px solid rgba(91,45,123,.1);background:#fff;border-radius:15px;padding:14px;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:14px;cursor:pointer}.mandato-record:hover{background:#fbf8fd;transform:translateY(-1px)}.mandato-record div{display:grid;gap:4px;min-width:0}.mandato-record span{font-size:.72rem;font-weight:900;color:var(--purple,#5b2d7b);text-transform:uppercase}.mandato-record strong{font-size:.94rem;color:#302439;overflow-wrap:anywhere}.mandato-record small{color:#756d79}.mandato-record>b{font-size:.78rem;color:var(--purple,#5b2d7b);white-space:nowrap}@media(max-width:700px){.previous-terms-folders{grid-template-columns:1fr}.mandato-folder-cover{min-height:180px;padding:22px;align-items:flex-end}.folder-open-label{white-space:normal;text-align:right}.mandato-record{align-items:flex-start}.mandato-record>b{white-space:normal;text-align:right;max-width:80px}}\n`
  write(globalCssPath, css)
}

let overrides = read(overridesPath)
if (!overrides.includes('/* HORIZONTAL_SCROLL_FIX */')) {
  overrides += `\n\n/* HORIZONTAL_SCROLL_FIX */\nhtml,body,#root{width:100%;max-width:100%;overflow-x:hidden}.liquid-bottom-nav{max-width:calc(100vw - 20px)}.liquid-bottom-nav-inner{overscroll-behavior-x:contain}.news-modal,.public-detail-panel,.tracking-result,.liquid-modal-card{max-width:calc(100vw - 20px)!important}@media(max-width:900px){.liquid-bottom-nav-inner{overflow-x:auto;max-width:100%;-webkit-overflow-scrolling:touch}.liquid-nav-item{flex-shrink:0}}\n`
  write(overridesPath, overrides)
}

let header = read(headerPath)
if (header.includes("['/#gabinete', MessageCircle, 'Fale com a vereadora']")) {
  header = header.replace("['/#gabinete', MessageCircle, 'Fale com a vereadora']", "['/#fale-com-a-vereadora', MessageCircle, 'Fale com a vereadora']")
  write(headerPath, header)
}

home = read(homePath)
if (!home.includes('id="fale-com-a-vereadora"')) {
  home = home.replace('<form id="form-demanda" className="demand-form" onSubmit={handleDemand}>', '<div id="fale-com-a-vereadora" className="contact-anchor" aria-hidden="true"></div>\\n            <form id="form-demanda" className="demand-form" onSubmit={handleDemand}>')
  write(homePath, home)
}

console.log('[mandatos] pastas hierarquicas, ancora de contato e correcoes de rolagem aplicadas.')
