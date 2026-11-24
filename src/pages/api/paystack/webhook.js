import { createHmac, timingSafeEqual } from 'crypto';
import { buffer } from 'micro';
import { completePaystackBooking, verifyPaystackTransaction } from '../../../lib/paystack';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method not allowed');
  }
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(500).send('Paystack secret key is not configured');
  }

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['x-paystack-signature'];
    const expectedSignature = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest();
    const receivedSignature = typeof signature === 'string'
      ? Buffer.from(signature, 'hex')
      : Buffer.alloc(0);

    if (
      receivedSignature.length !== expectedSignature.length
      || !timingSafeEqual(receivedSignature, expectedSignature)
    ) {
      return res.status(401).send('Invalid Paystack signature');
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    if (event.event === 'charge.success') {
      const reference = event.data?.reference;
      if (!reference) return res.status(400).send('Missing transaction reference');
      const transaction = await verifyPaystackTransaction(reference);
      await completePaystackBooking(reference, transaction);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return res.status(500).send('Unable to process Paystack webhook');
  }
}
