import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query, queryOne } from '../db.js'
import { success, error, parseJson } from '../utils/response.js'
import { createSanctumToken, deleteToken } from '../utils/sanctum.js'
import { isCmsUser, normalizeRole } from '../utils/roles.js'
import { requireCmsAdmin } from '../middleware/auth.js'

const router = Router()

const loginAttempts = new Map()

function rateKey(email, ip) {
  return `${String(email).toLowerCase()}|${ip}`
}

router.post('/login', async (req, res) => {
  try {
    const email = req.body?.email
    const password = req.body?.password
    if (!email || !password) {
      return res.status(422).json({
        message: 'The given data was invalid.',
        errors: { email: ['Email and password are required.'] },
      })
    }

    const key = rateKey(email, req.ip)
    const hit = loginAttempts.get(key)
    if (hit && hit.count >= 5 && Date.now() - hit.at < 60_000) {
      return error(res, 'Too many login attempts. Try again later.', 429)
    }

    const user = await queryOne(`SELECT * FROM users WHERE email = :email LIMIT 1`, { email })
    const ok =
      user &&
      Number(user.is_active) &&
      isCmsUser(user.role) &&
      (await bcrypt.compare(password, user.password))

    if (!ok) {
      const prev = loginAttempts.get(key) || { count: 0, at: Date.now() }
      loginAttempts.set(key, { count: prev.count + 1, at: Date.now() })
      return res.status(422).json({
        message: 'The given data was invalid.',
        errors: { email: ['The provided credentials are incorrect.'] },
      })
    }

    loginAttempts.delete(key)
    await query(`UPDATE users SET last_login_at = NOW() WHERE id = :id`, { id: user.id })
    const token = await createSanctumToken(user.id, 'cms-admin')

    return success(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
        assigned_markets: parseJson(user.assigned_markets, null),
        assigned_locales: parseJson(user.assigned_locales, null),
      },
    }, 'Logged in')
  } catch (err) {
    console.error(err)
    return error(res, 'Login failed', 500)
  }
})

router.post('/logout', requireCmsAdmin, async (req, res) => {
  try {
    await deleteToken(req.tokenId)
    return success(res, null, 'Logged out')
  } catch (err) {
    console.error(err)
    return error(res, 'Logout failed', 500)
  }
})

router.get('/me', requireCmsAdmin, async (req, res) => {
  const u = req.user
  return success(res, {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    assigned_markets: u.assigned_markets,
    assigned_locales: u.assigned_locales,
  })
})

export default router
