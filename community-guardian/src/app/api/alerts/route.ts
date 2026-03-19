import { NextResponse } from 'next/server'
import { apiBaseUrl } from '@/lib/apiBase'

function asString(v: string | null) {
  return v === null ? undefined : v
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const upstream = new URL(`${apiBaseUrl()}/alerts`)
  url.searchParams.forEach((v, k) => upstream.searchParams.set(k, v))

  const r = await fetch(upstream.toString(), { cache: 'no-store' })
  const body = await r.text()
  return new NextResponse(body, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') ?? 'application/json' },
  })
}

export async function POST(req: Request) {
  const payload = await req.text()
  const r = await fetch(`${apiBaseUrl()}/alerts`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: payload,
  })
  const body = await r.text()
  return new NextResponse(body, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') ?? 'application/json' },
  })
}

