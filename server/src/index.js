import express from 'express'
import cors from 'cors'
import path from 'node:path'
import fs from 'node:fs'
import { config } from './config.js'
import publicCms from './routes/publicCms.js'
import adminAuth from './routes/adminAuth.js'
import adminCms from './routes/adminCms.js'
import { success } from './utils/response.js'

const app = express()

app.set('trust proxy', 1)
app.use(cors({ origin: true, credentials: false }))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (_req, res) => success(res, null, 'ok'))

app.use('/api/cms', publicCms)
app.use('/api/cms/admin', adminAuth)
app.use('/api/cms/admin', adminCms)

fs.mkdirSync(config.uploadDir, { recursive: true })
app.use('/uploads', express.static(config.uploadDir))

// Optional: serve legacy Laravel public disk for existing media URLs under /storage
if (config.legacyStorageDir && fs.existsSync(config.legacyStorageDir)) {
  app.use('/storage', express.static(config.legacyStorageDir))
}

if (config.serveStatic) {
  const dist = config.distDir
  if (!fs.existsSync(dist)) {
    console.warn(`SERVE_STATIC=true but dist not found at ${dist}`)
  } else {
    app.use(express.static(dist))
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/storage')) {
        return next()
      }
      res.sendFile(path.join(dist, 'index.html'))
    })
  }
}

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ success: false, message: err.message || 'Server error', data: null })
})

app.listen(config.port, () => {
  console.log(`CMS API listening on :${config.port} (SERVE_STATIC=${config.serveStatic})`)
})
