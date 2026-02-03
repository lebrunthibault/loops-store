import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const loopId = session.metadata?.loop_id
    const userId = session.metadata?.user_id

    if (!loopId || !userId) {
      console.error('Missing metadata in checkout session')
      return NextResponse.json(
        { error: 'Missing metadata' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if purchase already exists (idempotency)
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('stripe_session_id', session.id)
      .single()

    if (existingPurchase) {
      console.log('Purchase already recorded:', session.id)
      return NextResponse.json({ received: true })
    }

    // Create purchase record
    const { error } = await supabase.from('purchases').insert({
      user_id: userId,
      loop_id: loopId,
      stripe_session_id: session.id,
    })

    if (error) {
      console.error('Failed to create purchase:', error)
      return NextResponse.json(
        { error: 'Failed to create purchase' },
        { status: 500 }
      )
    }

    console.log('Purchase recorded:', session.id)
  }

  return NextResponse.json({ received: true })
}
