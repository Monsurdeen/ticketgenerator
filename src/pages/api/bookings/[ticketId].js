import { createBrowserSupabase, createServiceSupabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ticketId = req.query.ticketId;
  const authorization = req.headers.authorization;
  if (!ticketId || !authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const accessToken = authorization.slice('Bearer '.length);
    const browserSupabase = createBrowserSupabase();
    const { data: { user }, error: authError } = await browserSupabase.auth.getUser(accessToken);
    if (authError || !user) return res.status(401).json({ error: 'Invalid session' });

    const supabase = createServiceSupabase();
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .contains('ticket_ids', [ticketId])
      .limit(1);
    if (error) throw error;

    const booking = bookings?.[0];
    if (!booking) return res.status(404).json({ error: 'Ticket not found' });
    if (user.email?.toLowerCase() !== booking.email.toLowerCase()) {
      return res.status(403).json({ error: 'This ticket belongs to another attendee' });
    }

    return res.status(200).json({ booking });
  } catch (error) {
    console.error('Booking lookup error:', error);
    return res.status(500).json({ error: 'Unable to retrieve ticket' });
  }
}
