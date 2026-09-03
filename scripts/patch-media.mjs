import fs from 'node:fs'

const path = 'src/pages/Admin.jsx'
if (fs.existsSync(path)) {
  let admin = fs.readFileSync(path, 'utf8')

  // Remove a opção Fotos e mídia do menu administrativo.
  admin = admin.replace(/\n\s*\['midia',\s*Image,\s*'Fotos e mídia'\],?/, '')

  // Remove a tela correspondente caso ainda exista no arquivo-base.
  admin = admin.replace(/\n\s*\{tab === 'midia' && <Placeholder title="Fotos e mídia"[^\n]*\}/, '')

  fs.writeFileSync(path, admin, 'utf8')
}
