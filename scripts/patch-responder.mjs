import fs from 'node:fs'

function patch(path, fn) {
  if (!fs.existsSync(path)) return
  const original = fs.readFileSync(path, 'utf8')
  const next = fn(original)
  fs.writeFileSync(path, next, 'utf8')
}

patch('src/services/firestore.js', code => {
  if (!code.includes('const publicPayload = {')) {
    code = code.replace(
      "export async function updateDemandAndTracking(protocol, privateUpdates, publicUpdates) {\n  const shortProtocol = normalizeProtocol(protocol)\n  const batch = writeBatch(db)",
      `export async function updateDemandAndTracking(protocol, privateUpdates, publicUpdates) {\n  const shortProtocol = normalizeProtocol(protocol)\n  const batch = writeBatch(db)\n  const publicPayload = {\n    ...publicUpdates,\n    servidorResponsavel: publicUpdates?.servidorResponsavel || privateUpdates?.servidorResponsavel || '',\n    historico: Array.isArray(publicUpdates?.historico)\n      ? publicUpdates.historico\n      : (Array.isArray(privateUpdates?.historicoPublico) ? privateUpdates.historicoPublico : [])\n  }`
    )

    code = code.replace(
      "      ...publicUpdates,\n      protocolo: shortProtocol,",
      "      ...publicPayload,\n      protocolo: shortProtocol,"
    )
  }
  return code
})

patch('src/pages/Home.jsx', home => {
  if (!home.includes('const trackingResponderName =')) {
    home = home.replace(
      "  return (\n    <>",
      `  const trackingResponderName = trackingResult\n    ? (trackingResult.servidorResponsavel || [...(trackingResult.historico || [])].reverse().find(item => item?.servidor)?.servidor || '')\n    : ''\n\n  return (\n    <>`
    )
  }

  home = home.replaceAll('trackingResult.servidorResponsavel && (', 'trackingResponderName && (')
  home = home.replaceAll('{trackingResult.servidorResponsavel}</strong>', '{trackingResponderName}</strong>')

  if (!home.includes('tracking-responder-fallback')) {
    home = home.replace(
      "                  <div className=\"tracking-subject\">\n                    <span>Assunto</span>",
      `                  {trackingResponderName && !home?.includes && null}\n                  <div className=\"tracking-subject tracking-responder-fallback\" style={{display: trackingResponderName ? 'block' : 'none'}}>\n                    <span>Respondido por</span>\n                    <strong>{trackingResponderName}</strong>\n                  </div>\n\n                  <div className=\"tracking-subject\">\n                    <span>Assunto</span>`
    )
  }

  return home
})
