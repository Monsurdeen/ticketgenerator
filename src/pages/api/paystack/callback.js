import { completePaystackBooking, verifyPaystackTransaction } from '../../../lib/paystack';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method not allowed');
  }

  const { booking: bookingId, reference } = req.query;
  if (typeof bookingId !== 'string' || typeof reference !== 'string') {
    return res.redirect(302, '/form?checkout=failed');
  }

  try {
    const transaction = await verifyPaystackTransaction(reference);
    const booking = await completePaystackBooking(reference, transaction, bookingId);
    return res.redirect(302, `/ticket?booking=${encodeURIComponent(booking.id)}`);
  } catch (error) {
    console.error('Paystack callback error:', error);
    return res.redirect(302, '/form?checkout=failed');
  }
}
