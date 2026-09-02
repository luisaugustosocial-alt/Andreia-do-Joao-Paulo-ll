import fs from 'node:fs'

const path = 'src/pages/Admin.jsx'
if (fs.existsSync(path)) {
  let admin = fs.readFileSync(path, 'utf8')
  admin = admin.replace(
    `{tab === 'midia' && <Placeholder title="Fotos e mídia" text="O upload de imagens pelo Firebase Storage será a próxima etapa." />}`,
    `{tab === 'midia' && <Placeholder title="Fotos e mídia" text="As imagens do site são armazenadas e gerenciadas pelo ImageKit. O upload já está integrado às publicações, como notícias e demais conteúdos com imagem." />}`
  )
  fs.writeFileSync(path, admin, 'utf8')
}
