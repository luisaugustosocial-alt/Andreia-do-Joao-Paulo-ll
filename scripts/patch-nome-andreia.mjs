import fs from 'node:fs'

const files = [
  'src/pages/Home.jsx',
  'src/pages/NotFound.jsx',
  'src/pages/PoliticaPrivacidade.jsx',
  'src/pages/TermosUso.jsx',
  'src/components/Header.jsx',
  'src/components/Footer.jsx'
]

for (const path of files) {
  if (!fs.existsSync(path)) continue
  let content = fs.readFileSync(path, 'utf8')
  content = content.replace(/\bAndreia\b(?! do João Paulo II)/g, 'Andreia do João Paulo II')
  content = content.replace(/\bANDREIA\b(?! DO JOÃO PAULO II)/g, 'ANDREIA DO JOÃO PAULO II')
  fs.writeFileSync(path, content)
}

console.log('[nome] nome público padronizado para Andreia do João Paulo II.')
