import { useCmsQuery } from './useCmsQuery'
import { resolveCmsArray } from '../utils/cmsContent'

/**
 * CMS list query with explicit empty-vs-error semantics.
 * Empty successful response → [] (render nothing).
 * Request error → optional fallback (resilience only).
 */
export function useCmsList(keyParts, path, { fallback = [], enabled = true, config } = {}) {
  const query = useCmsQuery(keyParts, path, { enabled, config })
  const { data, isSuccess, isError, isFetched, isPending } = query

  const items = resolveCmsArray(data, {
    isSuccess,
    isError,
    isFetched,
    fallback: isError ? fallback : [],
  })

  return {
    ...query,
    items,
    /** CMS answered successfully (array, possibly empty) */
    fromCms: isSuccess && Array.isArray(data),
    /** Still waiting for first response */
    isPending,
  }
}
