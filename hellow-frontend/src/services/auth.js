import { api } from './api'

const TOKEN_KEY = 'hellow_token'
const USER_KEY = 'hellow_user'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  try {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export function setStoredAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password })
  setStoredAuth(data.token, data.user)
  return data
}

export async function register(email, password, username) {
  const data = await api.post('/auth/register', { email, password, username })
  setStoredAuth(data.token, data.user)
  return data
}

export async function getMe() {
  return api.get('/auth/me')
}
