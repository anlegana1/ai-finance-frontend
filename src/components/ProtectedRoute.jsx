import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let mounted = true
    apiFetch('/auth/me')
      .then(() => {
        if (mounted) setStatus('ok')
      })
      .catch(() => {
        if (mounted) setStatus('unauth')
      })
    return () => {
      mounted = false
    }
  }, [])

  if (status === 'loading') {
    return null
  }

  if (status === 'unauth') {
    return <Navigate to="/login" replace />
  }
  return children
}
