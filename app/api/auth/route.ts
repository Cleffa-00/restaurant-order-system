import { NextRequest, NextResponse } from 'next/server'

// TODO: Implement /api/auth

// POST /api/auth
export async function POST(req: NextRequest) {
  // TODO: Admin login
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}

// GET /api/auth
export async function GET(req: NextRequest) {
  // TODO: Check admin auth status
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
