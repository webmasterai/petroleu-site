import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { findAll, findWhere } from '../storage/jsonStore'

export type CmsUser = {
  id: number
  name: string
  email: string
  passwordHash: string
  role: string
  isActive: boolean
  assignedMarkets?: string[] | null
  assignedLocales?: string[] | null
}

const COOKIE = 'petroleu_cms_session'
const CMS_ROLES = ['super_admin', 'administrator', 'editor', 'translator', 'viewer', 'cms_admin']

function secretKey() {
  const s = process.env.CMS_AUTH_SECRET || process.env.AUTH_SECRET || 'dev-only-change-me-petroleu-cms'
  return new TextEncoder().encode(s)
}

export function normalizeRole(role?: string | null) {
  if (!role || role === 'cms_admin') return 'super_admin'
  return role
}

export function isCmsUser(role?: string | null) {
  return CMS_ROLES.includes(normalizeRole(role))
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12)
}

export async function findUserByEmail(email: string) {
  const users = await findAll<CmsUser>('users')
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function createSessionToken(user: CmsUser) {
  return new SignJWT({
    sub: String(user.id),
    email: user.email,
    role: normalizeRole(user.role),
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey())
}

function cookieSecure() {
  if (process.env.CMS_COOKIE_SECURE === 'true') return true
  if (process.env.CMS_COOKIE_SECURE === 'false' || process.env.CMS_COOKIE_SECURE === '0') return false
  const site = process.env.NEXT_PUBLIC_SITE_URL || ''
  return site.startsWith('https://')
}

export async function setSessionCookie(token: string) {
  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: cookieSecure(),
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(COOKIE)
}

export async function userFromToken(token: string): Promise<Omit<CmsUser, 'passwordHash'> | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    const id = Number(payload.sub)
    const users = await findWhere<CmsUser>('users', (u) => u.id === id && u.isActive && isCmsUser(u.role))
    const user = users[0]
    if (!user) return null
    const { passwordHash, ...safe } = user
    void passwordHash
    return { ...safe, role: normalizeRole(user.role) }
  } catch {
    return null
  }
}

export async function getSessionUser(
  authHeader?: string | null,
): Promise<Omit<CmsUser, 'passwordHash'> | null> {
  if (authHeader?.startsWith('Bearer ')) {
    const fromBearer = await userFromToken(authHeader.slice(7).trim())
    if (fromBearer) return fromBearer
  }
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return null
  return userFromToken(token)
}
