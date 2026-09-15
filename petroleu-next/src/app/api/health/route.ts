import { NextResponse } from 'next/server'
import { ensureSeedData } from '@/lib/storage/ensureSeed'

export async function GET() {
  const seed = await ensureSeedData()
  return NextResponse.json({ success: true, message: 'ok', data: { seed } })
}
