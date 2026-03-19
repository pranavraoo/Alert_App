import { NextResponse } from 'next/server'
import { apiBaseUrl } from '@/lib/apiBase'

type RouteCtx = { params: Promise<{ id: string }> }

export async function DELETE(_: Request, ctx: RouteCtx) {
  const { id } = await ctx.params

  const r = await fetch(`${apiBaseUrl()}/guardians/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  const body = await r.text()
  return new NextResponse(body, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') ?? 'application/json' },
  })
}