export async function requireFirebaseUser(req) {
  const apiKey = process.env.FIREBASE_API_KEY
  if (!apiKey) {
    const error = new Error('FIREBASE_API_KEY não configurada no servidor.')
    error.statusCode = 500
    throw error
  }

  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) {
    const error = new Error('Autenticação obrigatória.')
    error.statusCode = 401
    throw error
  }

  const idToken = header.slice(7)
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    }
  )

  if (!response.ok) {
    const error = new Error('Sessão administrativa inválida ou expirada.')
    error.statusCode = 401
    throw error
  }

  const payload = await response.json()
  const user = payload.users?.[0]
  if (!user) {
    const error = new Error('Usuário não autenticado.')
    error.statusCode = 401
    throw error
  }

  return user
}
