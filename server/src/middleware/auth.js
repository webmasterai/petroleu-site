import { findUserByBearer } from '../utils/sanctum.js'
import { isCmsUser, normalizeRole } from '../utils/roles.js'
import { error } from '../utils/response.js'
import { parseJson } from '../utils/response.js'

export async function requireCmsAdmin(req, res, next) {
  try {
    const found = await findUserByBearer(req.headers.authorization)
    if (!found?.user) {
      return error(res, 'Unauthenticated', 401)
    }
    const user = found.user
    if (!Number(user.is_active) || !isCmsUser(user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized', data: null })
    }
    req.user = {
      ...user,
      role: normalizeRole(user.role),
      assigned_markets: parseJson(user.assigned_markets, null),
      assigned_locales: parseJson(user.assigned_locales, null),
    }
    req.tokenId = found.tokenId
    next()
  } catch (err) {
    console.error(err)
    return error(res, 'Auth error', 500)
  }
}
