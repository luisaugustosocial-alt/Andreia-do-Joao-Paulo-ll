import ImageKit from '@imagekit/nodejs'
import { requireFirebaseUser } from './_auth.js'

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY
})

const PUBLIC_KEY = 'public_vwtlqICXUSxwYIQWMKmyE5pmV/Y='

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    return res.status(500).json({ error: 'IMAGEKIT_PRIVATE_KEY não configurada.' })
  }

  try {
    await requireFirebaseUser(req)
    const params = imagekit.helper.getAuthenticationParameters()
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ ...params, publicKey: PUBLIC_KEY })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.statusCode === 401 ? 'Não autorizado.' : 'Não foi possível autorizar o upload.'
    })
  }
}
