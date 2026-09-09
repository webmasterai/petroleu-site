import axios from 'axios'

const normalizedBase = (import.meta.env.VITE_CMS_API_BASE_URL || '/api/cms').replace(/\/+$/, '')

export const cmsApi = axios.create({
  baseURL: normalizedBase,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

/** Public CMS GET (no admin token). */
export async function cmsGet(path, config = {}) {
  const res = await cmsApi.get(path, config)
  const body = res.data
  if (body?.data !== undefined) return body.data
  return body
}

/** Public CMS POST (contact, demo request). */
export async function cmsPost(path, body, config = {}) {
  const res = await cmsApi.post(path, body, config)
  return res.data
}

/** POST without throwing on 4xx — readable status + JSON body. */
export async function cmsPostWithHttpStatus(path, body, config = {}) {
  const res = await cmsApi.post(path, body, {
    ...config,
    validateStatus: () => true,
  })
  return { status: res.status, data: res.data }
}
