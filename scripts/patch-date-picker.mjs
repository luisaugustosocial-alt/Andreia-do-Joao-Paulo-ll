import fs from 'node:fs'

const adminPath = 'src/pages/Admin.jsx'
const cssPath = 'src/styles/admin.css'

let admin = fs.readFileSync(adminPath, 'utf8')

// Adiciona abertura explícita do seletor nativo em TODOS os campos de data,
// inclusive os que são injetados pelos patches da linha do tempo e mandatos.
admin = admin.replace(
  /<input type="date"(?![^>]*showPicker)/g,
  '<input type="date" onClick={e => { try { e.currentTarget.showPicker?.() } catch {} }}'
)

fs.writeFileSync(adminPath, admin)

let css = fs.readFileSync(cssPath, 'utf8')
const marker = '/* DATE_PICKER_RESTORE */'
const styles = `${marker}\n.admin-form input[type="date"]{cursor:pointer!important;color-scheme:light!important;-webkit-appearance:auto!important;appearance:auto!important;padding-right:10px!important}.admin-form input[type="date"]::-webkit-calendar-picker-indicator{display:block!important;visibility:visible!important;opacity:1!important;cursor:pointer!important;pointer-events:auto!important;width:20px!important;height:20px!important}`

if (css.includes(marker)) {
  css = css.replace(/\/\* DATE_PICKER_RESTORE \*\/[\s\S]*?(?=\n\/\*|$)/, styles)
} else {
  css += `\n\n${styles}\n`
}

fs.writeFileSync(cssPath, css)
console.log('[date-picker] calendário nativo restaurado em todos os campos de data do painel.')
