import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useEffect } from 'react'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(undefined)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => setCurrentUser(user))
    return unsubscribe
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      navigate('/admin', { replace: true })
    } catch (err) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('E-mail ou senha inválidos.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde.')
      } else {
        setError('Não foi possível entrar. Verifique os dados e tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (currentUser) {
    return <Navigate to="/admin" replace />
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-brand">
          <span>VEREADORA</span>
          <strong>ANDREIA</strong>
          <small>DO JOÃO PAULO II</small>
        </div>

        <div>
          <span className="section-kicker">ÁREA RESTRITA</span>
          <h1>Painel do mandato</h1>
          <p>Entre com o e-mail e a senha cadastrados no Firebase.</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="admin-login-error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <a href="/" className="admin-login-back">Voltar ao site</a>
      </section>
    </main>
  )
}
