import fs from 'node:fs'

const adminPath = 'src/pages/Admin.jsx'
const cssPath = 'src/styles/admin.css'

let admin = fs.readFileSync(adminPath, 'utf8')

// Mantém o input nativo de data e força a abertura do seletor quando o navegador suporta showPicker().
// O replace é global para restaurar o comportamento em Agenda, Notícias, Proposições,
// Transparência e também no Dossiê de Mandatos Anteriores gerado durante o build.
admin = admin.replace(
  /<input type="date" value=\{([^}]+)\} onChange=\{([^}]+)\}\/>/g,
  '<input type="date" value={$1} onClick={e => e.currentTarget.showPicker?.()} onFocus={e => e.currentTarget.showPicker?.()} onChange={$2}/>'
)

fs.writeFileSync(adminPath, admin)

let css = fs.readFileSync(cssPath, 'utf8')
if (!css.includes('/* DATE_PICKER_RESTORE */')) {
  css += `\n\n/* DATE_PICKER_RESTORE */\n.admin-form input[type="date"]{cursor:pointer;color-scheme:light}.admin-form input[type="date"]::-webkit-calendar-picker-indicator{display:block;opacity:1;cursor:pointer;pointer-events:auto}\n`
  fs.writeFileSync(cssPath, css)
}

console.log('[date-picker] calendário nativo restaurado nos campos de data do painel.')
