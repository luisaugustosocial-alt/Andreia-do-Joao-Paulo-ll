import crypto from 'node:crypto'
import { requireFirebaseUser } from './_auth.js'

function getKey() {
  const secret = process.env.DATA_ENCRYPTION_KEY
  if (!secret || secret.length < 32) {
    const error = new Error('DATA_ENCRYPTION_KEY deve ter pelo menos 32 caracteres.')
    error.statusCode = 500
    throw error
  }
  return crypto.createHash('sha256').update(secret, 'utf8').digest()
}

function encryptString(value) {
  if (value === null || value === undefined || value === '') return ''
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1:${iv.toString('base64url')}:${tag.toString('base64url')}:${ciphertext.toString('base64url')}`
}

function decryptString(payload) {
  if (!payload) return ''
  const [version, ivPart, tagPart, dataPart] = String(payload).split(':')
  if (version !== 'v1' || !ivPart || !tagPart || !dataPart) throw new Error('Dado criptografado inválido.')
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivPart, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'))
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(dataPart, 'base64url')),
    decipher.final()
  ])
  return plaintext.toString('utf8')
}

function mapValues(data, transform) {
  return Object.fromEntries(Object.entries(data || {}).map(([key, value]) => [key, transform(value)]))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  res.setHeader('Cache-Control', 'no-store')

  try {
    const { action, data } = req.body || {}

    if (action === 'encrypt') {
      return res.status(200).json({ data: mapValues(data, encryptString) })
    }

    if (action === 'decrypt') {
      await requireFirebaseUser(req)
      return res.status(200).json({ data: mapValues(data, decryptString) })
    }

    return res.status(400).json({ error: 'Ação inválida.' })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.statusCode === 401 ? 'Não autorizado.' : 'Não foi possível processar os dados protegidos.'
    })
  }
}
