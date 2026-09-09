import { cmsGet } from './cmsApi'

export async function safeCmsGet(path, config) {
  try {
    return await cmsGet(path, config)
  } catch {
    return null
  }
}
