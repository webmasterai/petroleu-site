import { createInterface } from 'readline'
import { promises as fs } from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const dataDir = process.env.CMS_DATA_DIR || path.join(process.cwd(), 'storage', 'data')
const usersFile = path.join(dataDir, 'users.json')

function ask(rl, q) {
  return new Promise((resolve) => rl.question(q, resolve))
}

async function main() {
  await fs.mkdir(dataDir, { recursive: true })
  let users = []
  try {
    users = JSON.parse(await fs.readFile(usersFile, 'utf8'))
  } catch {
    users = []
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const name = (await ask(rl, 'Name [CMS Admin]: ')) || 'CMS Admin'
  const email = (await ask(rl, 'Email [admin@petroleu.local]: ')) || 'admin@petroleu.local'
  const password = await ask(rl, 'Password (min 8): ')
  rl.close()

  if (!password || password.length < 8) {
    console.error('Password too short')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const existing = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())
  const row = {
    id: existing >= 0 ? users[existing].id : users.reduce((m, u) => Math.max(m, u.id || 0), 0) + 1,
    name,
    email,
    passwordHash,
    role: 'super_admin',
    isActive: true,
    assignedMarkets: null,
    assignedLocales: null,
  }
  if (existing >= 0) users[existing] = row
  else users.push(row)

  const tmp = `${usersFile}.tmp`
  await fs.writeFile(tmp, JSON.stringify(users, null, 2))
  await fs.rename(tmp, usersFile)
  console.log(`CMS admin ready: ${email} (id ${row.id})`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
