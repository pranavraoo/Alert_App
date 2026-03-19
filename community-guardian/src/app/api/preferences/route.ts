import { NextRequest, NextResponse } from 'next/server'
import { apiBaseUrl } from '@/lib/apiBase'

export async function GET() {
  const r = await fetch(`${apiBaseUrl()}/preferences`, { cache: 'no-store' })
  const body = await r.text()
  return new NextResponse(body, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') ?? 'application/json' },
  })
}

export async function PATCH(req: NextRequest) {
  const payload = await req.text()
  const r = await fetch(`${apiBaseUrl()}/preferences`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: payload,
  })
  const body = await r.text()
  return new NextResponse(body, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') ?? 'application/json' },
  })
}