import { createBrowserSupabase, createServiceSupabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authorization = req.headers.authorization;
  const bookingId = req.query.bookingId;
  if (!authorization?.startsWith('Bearer ') || !bookingId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const accessToken = authorization.slice('Bearer '.length);
    const browserSupabase = createBrowserSupabase();
    const { data: { user }, error: authError } = await browserSupabase.auth.getUser(accessToken);
    if (authError || !user) return res.status(401).json({ error: 'Invalid session' });

    const supabase = createServiceSupabase();
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    if (error?.code === 'PGRST116') return res.status(404).json({ error: 'Booking not found' });
    if (error) throw error;
    if (user.email?.toLowerCase() !== booking.email.toLowerCase()) {
      return res.status(403).json({ error: 'This booking belongs to another attendee' });
    }
    if (booking.payment_status !== 'paid') {
      return res.status(409).json({ error: 'Payment is not complete' });
    }

    return res.status(200).json({ booking });
  } catch (error) {
    console.error('Booking lookup error:', error);
    return res.status(500).json({ error: 'Unable to retrieve booking' });
  }
}
