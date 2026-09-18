/**
 * Local production start matching Dockerfile:
 * node server.js from .next/standalone with .next/static + public present.
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const standalone = path.join(root, '.next', 'standalone')
const serverJs = path.join(standalone, 'server.js')

if (!existsSync(serverJs)) {
  console.error('Missing .next/standalone/server.js — run npm run build first.')
  process.exit(1)
}

mkdirSync(path.join(standalone, '.next'), { recursive: true })

const staticSrc = path.join(root, '.next', 'static')
const staticDest = path.join(standalone, '.next', 'static')
const publicSrc = path.join(root, 'public')
const publicDest = path.join(standalone, 'public')

if (existsSync(staticSrc)) {
  cpSync(staticSrc, staticDest, { recursive: true })
}
if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true })
}

const child = spawn(process.execPath, ['server.js'], {
  cwd: standalone,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || '3000',
    HOSTNAME: process.env.HOSTNAME || '0.0.0.0',
    CMS_DATA_DIR: process.env.CMS_DATA_DIR || path.join(root, 'storage', 'data'),
    CMS_UPLOAD_DIR: process.env.CMS_UPLOAD_DIR || path.join(root, 'storage', 'uploads'),
  },
})

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 1)
})
