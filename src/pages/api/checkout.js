import { createServiceSupabase } from '../../lib/supabase';
import { randomUUID } from 'crypto';

const PRICES_NGN = {
  'Free': 0,
  'VIP': 150000,
  'VVIP': 150000,
  '$150 VIP': 150000,
  '$150 VVIP': 150000,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, avatar, specialRequest, ticketType, quantity } = req.body;
    const parsedQuantity = Number(quantity);

    if (
      !name?.trim()
      || !email?.trim()
      || !Object.prototype.hasOwnProperty.call(PRICES_NGN, ticketType)
    ) {
      return res.status(400).json({ error: 'Missing or invalid booking details' });
    }
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 4) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 4' });
    }
    if (PRICES_NGN[ticketType] > 0 && !process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const normalizedTicketType = ticketType === '$150 VIP'
      ? 'VIP'
      : ticketType === '$150 VVIP'
        ? 'VVIP'
        : ticketType;
    const supabase = createServiceSupabase();
    const amountKobo = PRICES_NGN[ticketType] * parsedQuantity * 100;
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar_url: typeof avatar === 'string' && avatar.startsWith('data:image/') ? null : avatar || null,
        special_request: specialRequest?.trim() || null,
        ticket_type: normalizedTicketType,
        quantity: parsedQuantity,
        amount_cents: amountKobo,
        currency: 'ngn',
        payment_status: amountKobo === 0 ? 'paid' : 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    if (amountKobo === 0) {
      const ticketIds = Array.from({ length: parsedQuantity }, (_, index) =>
        `TECHEMBER26-${booking.id.slice(0, 8).toUpperCase()}-${index + 1}`
      );
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ ticket_ids: ticketIds })
        .eq('id', booking.id);
      if (updateError) throw updateError;
      return res.status(200).json({ bookingId: booking.id, ticketIds, successUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/ticket?booking=${booking.id}` });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const reference = randomUUID();
    const { error: referenceError } = await supabase
      .from('bookings')
      .update({ paystack_reference: reference })
      .eq('id', booking.id);
    if (referenceError) throw referenceError;

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        amount: amountKobo,
        currency: 'NGN',
        reference,
        callback_url: `${appUrl}/api/paystack/callback?booking=${booking.id}`,
        metadata: { bookingId: booking.id, ticketType: normalizedTicketType, quantity: parsedQuantity },
      }),
    });
    const result = await paystackResponse.json();
    if (!paystackResponse.ok || !result.status || !result.data?.authorization_url) {
      throw new Error(result.message || 'Paystack could not initialize this payment');
    }

    return res.status(200).json({ url: result.data.authorization_url, bookingId: booking.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Unable to start checkout' });
  }
}
