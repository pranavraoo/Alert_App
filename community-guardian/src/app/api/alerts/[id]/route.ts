import { NextResponse } from 'next/server'
import { apiBaseUrl } from '@/lib/apiBase'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await req.json()
    const r = await fetch(`${apiBaseUrl()}/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await r.json()
    return NextResponse.json(body, { status: r.status })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
