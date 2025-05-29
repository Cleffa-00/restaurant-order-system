import { NextRequest, NextResponse } from 'next/server'

// POST /api/stripe
export async function POST(req: NextRequest) {
  // TODO: Create Stripe checkout session
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 })
}
