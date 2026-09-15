import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

function uploadsRoot() {
  return process.env.CMS_UPLOAD_DIR || path.join(process.cwd(), 'storage', 'uploads')
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await ctx.params
  const root = path.resolve(uploadsRoot())
  const target = path.resolve(root, ...parts)
  if (!target.startsWith(root + path.sep) && target !== root) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }
  try {
    const buf = await fs.readFile(target)
    const ext = path.extname(target).toLowerCase()
    const type =
      ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : ext === '.webp'
            ? 'image/webp'
            : ext === '.gif'
              ? 'image/gif'
              : ext === '.mp4'
                ? 'video/mp4'
                : ext === '.pdf'
                  ? 'application/pdf'
                  : 'application/octet-stream'
    return new NextResponse(buf, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }
}
