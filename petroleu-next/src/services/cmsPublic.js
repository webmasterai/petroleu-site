import { cmsGet } from './cmsApi'

export async function safeCmsGet(path, config, marketLocale) {
  try {
    return await cmsGet(path, config, marketLocale)
  } catch {
    return null
  }
}
