import { API_URL } from '../utils/constants'

const TOKEN_KEY = 'hellow_token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

async function request(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('hellow_user')
    window.location.href = '/login'
    throw new Error('Session expired')
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  get: (url) => request(url),
  post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
  patch: (url, data) => request(url, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (url) => request(url, { method: 'DELETE' }),
  upload: (url, formData) => {
    const token = getToken()
    return fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY)
        window.location.href = '/login'
        throw new Error('Session expired')
      }
      if (!res.ok) throw new Error('Upload failed')
      return res.json()
    })
  },
}
