import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../lib/api'
import { useT } from '../lib/i18n.jsx'

export default function RegisterPage() {
  const navigate = useNavigate()
  const t = useT()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [defaultCurrency, setDefaultCurrency] = useState('CAD')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          default_currency: String(defaultCurrency || 'CAD').toUpperCase(),
        }),
        credentials: 'include',
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.detail || 'Register failed')
      }

      const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const loginData = await loginRes.json().catch(() => null)
      if (!loginRes.ok) {
        throw new Error(loginData?.detail || 'Login failed')
      }

      localStorage.setItem('user', JSON.stringify(loginData))
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>{t('register_title')}</h1>
        <p className="muted">{t('register_subtitle')}</p>

        <form onSubmit={onSubmit} className="form">
          <label className="label">
            {t('register_email')}
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
            {t('register_password')}
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </label>

          <label className="label">
            {t('register_currency')}
            <select
              className="input"
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
            >
              <option value="CAD">CAD</option>
              <option value="USD">USD</option>
              <option value="COP">COP</option>
            </select>
          </label>

          {error ? <div className="error">{error}</div> : null}

          <button className="button" type="submit" disabled={loading}>
            {loading ? t('register_loading') : t('register_button')}
          </button>

          <button className="button secondary" type="button" onClick={() => navigate('/login')}>
            {t('register_back_to_login')}
          </button>
        </form>
      </div>
    </div>
  )
}
