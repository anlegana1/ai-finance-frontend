export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {})

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  let data = null
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    data = await res.json()
  } else {
    data = await res.text()
  }

  if (!res.ok) {
    const detail = typeof data === 'string' ? data : data?.detail
    throw new Error(detail || `Request failed (${res.status})`)
  }

  return data
}
