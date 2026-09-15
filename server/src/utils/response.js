export function success(res, data = null, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, message, data })
}

export function error(res, message = 'Error', status = 400, errors = null) {
  return res.status(status).json({ success: false, message, errors, data: null })
}

/** Parse JSON columns that may already be objects (mysql2) or strings. */
export function parseJson(value, fallback = null) {
  if (value == null) return fallback
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
