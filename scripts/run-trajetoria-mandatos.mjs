import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const sourcePath = 'scripts/patch-trajetoria-mandatos.mjs'
let source = fs.readFileSync(sourcePath, 'utf8')

// O patch contém trechos de JSX com template literals que precisam chegar
// literalmente aos arquivos gerados. Escapamos as interpolações internas
// e preservamos somente as interpolações usadas pelo próprio patch.
source = source.replaceAll('${', '\\${')
source = source
  .replaceAll('\\${label}', '${label}')
  .replaceAll('\\${timelineSection}', '${timelineSection}')
  .replaceAll('\\${mandatosSection}', '${mandatosSection}')

const runtimePath = path.join(os.tmpdir(), `andreia-trajetoria-${Date.now()}.mjs`)
fs.writeFileSync(runtimePath, source)

try {
  await import(`${pathToFileURL(runtimePath).href}?v=${Date.now()}`)
} finally {
  try { fs.unlinkSync(runtimePath) } catch {}
}
