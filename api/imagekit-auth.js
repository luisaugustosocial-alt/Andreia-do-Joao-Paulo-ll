import ImageKit from '@imagekit/nodejs'

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY
})

const PUBLIC_KEY = 'public_vwtlqICXUSxwYIQWMKmyE5pmV/Y='

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Método não permitido.'
    })
  }

  if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    return res.status(500).json({
      error: 'IMAGEKIT_PRIVATE_KEY não configurada.'
    })
  }

  const authHeader = req.headers.authorization || ''

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Não autorizado.'
    })
  }

  const idToken = authHeader.slice(7)

  try {
    // Confere se quem está solicitando o upload
    // está realmente autenticado no Firebase.
    const verifyResponse = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyDMGGQjhuG3LEfsBek9LT_1k_69RksWn-A',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idToken
        })
      }
    )

    if (!verifyResponse.ok) {
      return res.status(401).json({
        error: 'Sessão inválida.'
      })
    }

    // Gera token, assinatura e validade para
    // permitir o upload direto ao ImageKit.
    const params =
      imagekit.helper.getAuthenticationParameters()

    return res.status(200).json({
      ...params,
      publicKey: PUBLIC_KEY
    })

  } catch (error) {
    console.error('Erro ImageKit:', error)

    return res.status(500).json({
      error: 'Não foi possível autorizar o upload.'
    })
  }
}
