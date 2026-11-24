import { createServiceSupabase } from './supabase';
import { getResend } from './providers';

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character]));
}

export async function verifyPaystackTransaction(reference) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const result = await response.json();
  if (!response.ok || !result.status || !result.data) {
    throw new Error(result.message || 'Unable to verify Paystack payment');
  }
  return result.data;
}

export async function completePaystackBooking(reference, transaction, expectedBookingId) {
  if (
    transaction.reference !== reference
    || transaction.status !== 'success'
    || transaction.currency !== 'NGN'
  ) {
    throw new Error('Paystack transaction is not a successful NGN payment');
  }

  const supabase = createServiceSupabase();
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('paystack_reference', reference)
    .single();
  if (error) throw error;
  if (expectedBookingId && booking.id !== expectedBookingId) {
    throw new Error('Paystack transaction does not match the callback booking');
  }

  if (
    transaction.amount !== booking.amount_cents
    || transaction.customer?.email?.toLowerCase() !== booking.email.toLowerCase()
  ) {
    throw new Error('Paystack transaction does not match the booking');
  }
  if (booking.payment_status === 'paid') return booking;
  if (booking.payment_status !== 'pending') {
    throw new Error('Booking is not awaiting payment');
  }

  const ticketIds = Array.from({ length: booking.quantity }, (_, index) =>
    `TECHEMBER26-${booking.id.slice(0, 8).toUpperCase()}-${index + 1}`
  );
  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({ payment_status: 'paid', ticket_ids: ticketIds })
    .eq('id', booking.id)
    .eq('payment_status', 'pending')
    .select()
    .maybeSingle();
  if (updateError) throw updateError;

  if (updatedBooking) {
    try {
      const resend = getResend();
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Techember Fest <tickets@example.com>',
        to: booking.email,
        subject: `Your Techember Fest '26 ticket`,
        html: `<h1>Your ticket is confirmed</h1><p>Hello ${escapeHtml(booking.name)},</p><p>Your ${booking.quantity} ticket(s) for Techember Fest '26 are confirmed.</p><p><strong>${ticketIds.join('<br />')}</strong></p><p>Present these ticket IDs at check-in.</p>`,
      });
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
    }
    return updatedBooking;
  }

  const { data: currentBooking, error: currentError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', booking.id)
    .single();
  if (currentError) throw currentError;
  if (currentBooking.payment_status !== 'paid') {
    throw new Error('Unable to complete booking payment');
  }
  return currentBooking;
}
