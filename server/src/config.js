import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

export const config = {
  port: Number(process.env.PORT || 3040),
  serveStatic: String(process.env.SERVE_STATIC || 'false').toLowerCase() === 'true',
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: (process.env.APP_URL || '').replace(/\/+$/, ''),
  uploadDir: path.resolve(root, process.env.UPLOAD_DIR || 'uploads'),
  legacyStorageDir: process.env.LEGACY_STORAGE_DIR
    ? path.resolve(root, process.env.LEGACY_STORAGE_DIR)
    : null,
  distDir: path.resolve(root, '../dist'),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_DATABASE || '',
    user: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
  },
  sanctumTokenableType: 'App\\Models\\User',
}
