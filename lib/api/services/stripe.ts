import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing. Please add it to your environment variables.')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any, // Force the type to avoid version mismatch issues
})

export interface LineItem {
  name: string
  description?: string
  amount: number
  quantity: number
}

export async function createCheckoutSession(
  customerEmail: string,
  lineItems: LineItem[],
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems.map((item) => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
          },
          unit_amount: Math.round(item.amount * 100), // Convert to cents
        },
        quantity: item.quantity,
      }
    }),
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
  })

  return session
}

export default stripe
