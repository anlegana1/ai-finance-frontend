import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../lib/api'
import { useT } from '../lib/i18n.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const t = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function checkSession() {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        })

        if (!cancelled && res.ok) {
          navigate('/', { replace: true })
        }
      } finally {
        if (!cancelled) setCheckingSession(false)
      }
    }

    checkSession()
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.detail || 'Login failed')
      }

      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="container">
        <div className="card">
          <h1>{t('login_title')}</h1>
          <p className="muted">{t('session_checking')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <h1>{t('login_title')}</h1>
        <p className="muted">{t('login_subtitle')}</p>

        <form onSubmit={onSubmit} className="form">
          <label className="label">
            {t('login_email')}
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="label">
            {t('login_password')}
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <div className="error">{error}</div> : null}

          <button className="button" type="submit" disabled={loading}>
            {loading ? t('login_loading') : t('login_button')}
          </button>
        </form>
      </div>
    </div>
  )
}
