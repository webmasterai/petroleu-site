import axios from 'axios'

const normalizedBase = '/api/cms'

export const cmsApi = axios.create({
  baseURL: normalizedBase,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

function withMarketParams(config = {}, marketLocale) {
  if (!marketLocale) return config
  return {
    ...config,
    params: {
      market: marketLocale.market,
      locale: marketLocale.locale,
      ...(config.params || {}),
    },
  }
}

export async function cmsGet(path, config = {}, marketLocale) {
  const res = await cmsApi.get(path, withMarketParams(config, marketLocale))
  const body = res.data
  if (body?.data !== undefined) return body.data
  return body
}

export async function cmsPost(path, body, config = {}) {
  const res = await cmsApi.post(path, body, config)
  return res.data
}

export async function cmsPostWithHttpStatus(path, body, config = {}) {
  const res = await cmsApi.post(path, body, {
    ...config,
    validateStatus: () => true,
  })
  return { status: res.status, data: res.data }
}
