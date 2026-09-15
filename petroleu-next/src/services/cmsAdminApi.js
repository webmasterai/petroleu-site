import axios from 'axios'

const base = '/api/cms'

export const cmsAdminApi = axios.create({
  baseURL: `${base}/admin`,
  headers: { Accept: 'application/json' },
  withCredentials: true,
})

cmsAdminApi.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cms_admin_token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function setAdminToken(token) {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem('cms_admin_token', token)
  else localStorage.removeItem('cms_admin_token')
}

export function getAdminToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('cms_admin_token')
}

export async function adminLogin(email, password) {
  const { data } = await cmsAdminApi.post('/login', { email, password })
  const payload = data?.data ?? data
  if (payload?.token) setAdminToken(payload.token)
  return payload
}

export async function adminLogout() {
  try {
    await cmsAdminApi.post('/logout')
  } finally {
    setAdminToken(null)
  }
}

export async function adminGet(path, config) {
  const { data } = await cmsAdminApi.get(path, config)
  return data?.data !== undefined ? data.data : data
}

export async function adminPost(path, body, config) {
  const { data } = await cmsAdminApi.post(path, body, config)
  return data?.data !== undefined ? data.data : data
}

export async function adminPut(path, body, config) {
  const { data } = await cmsAdminApi.put(path, body, config)
  return data?.data !== undefined ? data.data : data
}

export async function adminDelete(path, config) {
  const { data } = await cmsAdminApi.delete(path, config)
  return data?.data !== undefined ? data.data : data
}
