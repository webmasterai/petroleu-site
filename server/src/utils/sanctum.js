import crypto from 'node:crypto'
import { query, queryOne } from '../db.js'
import { config } from '../config.js'

function sha256(plain) {
  return crypto.createHash('sha256').update(plain).digest('hex')
}

/** Create Sanctum-compatible personal access token. Returns plainTextToken `id|plain`. */
export async function createSanctumToken(userId, name = 'cms-admin') {
  const plain = crypto.randomBytes(40).toString('hex')
  const hash = sha256(plain)
  const result = await query(
    `INSERT INTO personal_access_tokens
      (tokenable_type, tokenable_id, name, token, abilities, created_at, updated_at)
     VALUES (:type, :uid, :name, :token, :abilities, NOW(), NOW())`,
    {
      type: config.sanctumTokenableType,
      uid: userId,
      name,
      token: hash,
      abilities: JSON.stringify(['*']),
    },
  )
  const id = result.insertId
  return `${id}|${plain}`
}

export async function findUserByBearer(authorization) {
  if (!authorization || !authorization.startsWith('Bearer ')) return null
  const raw = authorization.slice(7).trim()
  const pipe = raw.indexOf('|')
  if (pipe <= 0) return null
  const id = Number(raw.slice(0, pipe))
  const plain = raw.slice(pipe + 1)
  if (!id || !plain) return null

  const row = await queryOne(
    `SELECT * FROM personal_access_tokens WHERE id = :id LIMIT 1`,
    { id },
  )
  if (!row) return null
  if (row.token !== sha256(plain)) return null
  if (row.expires_at && new Date(row.expires_at) < new Date()) return null

  await query(`UPDATE personal_access_tokens SET last_used_at = NOW() WHERE id = :id`, { id })

  const user = await queryOne(`SELECT * FROM users WHERE id = :id LIMIT 1`, {
    id: row.tokenable_id,
  })
  if (!user) return null
  return { user, tokenId: row.id }
}

export async function deleteToken(tokenId) {
  await query(`DELETE FROM personal_access_tokens WHERE id = :id`, { id: tokenId })
}
