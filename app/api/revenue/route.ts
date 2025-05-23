import { NextRequest, NextResponse } from 'next/server'

// GET /api/revenue
export async function GET(req: NextRequest) {
  // TODO: Get revenue analytics
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
} 