import { useEffect, useState, useRef } from 'react';
import { Calendar, CheckCircle2, Download, MapPin, PencilLine, Ticket as TicketIcon } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRouter } from 'next/router';
import { getFromLocalStorage } from '../utils/storage';
import { Button } from '../components/ui/button';
import Image from 'next/image';
import { createBrowserSupabase } from '../lib/supabase';

export default function Ticket() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ticketType, setTicketType] = useState('Free');
  const [ticketCount, setTicketCount] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const barcodeRef = useRef(null);
  const ticketRef = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;

    const loadBooking = async () => {
      const bookingId = typeof router.query.booking === 'string' ? router.query.booking : null;
      const storedUser = getFromLocalStorage('ticketUser');

      if (!bookingId) {
        if (!storedUser?.name || !storedUser?.email) {
          router.replace('/form');
          return;
        }
        setUser(storedUser);
        setTicketType(getFromLocalStorage('ticketType') || 'Free');
        setTicketCount(String(getFromLocalStorage('selectedTickets') || '1'));
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createBrowserSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace(`/auth?next=${encodeURIComponent(`/ticket?booking=${bookingId}`)}`);
          return;
        }

        const response = await fetch(`/api/bookings/record/${bookingId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load ticket');

        const booking = result.booking;
        setUser({
          name: booking.name,
          email: booking.email,
          avatar: storedUser?.avatar || null,
          specialRequest: booking.special_request,
          ticketId: booking.ticket_ids?.[0] || booking.id,
        });
        setTicketType(booking.ticket_type);
        setTicketCount(String(booking.quantity));
        setIsLoading(false);
      } catch (bookingError) {
        setDownloadError(bookingError.message);
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [router]);

  useEffect(() => {
    if (user?.ticketId && barcodeRef.current) {
      JsBarcode(barcodeRef.current, user.ticketId, {
        format: 'CODE128',
        lineColor: '#000',
        background: '#fff',
        width: 2,
        height: 60,
        displayValue: false,
      });
    }
  }, [user]);

  const downloadPDF = async () => {
    if (!ticketRef.current || isDownloading) return;
    setIsDownloading(true);
    setDownloadError('');

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#124853',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imageWidth = 190;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const x = (pageWidth - imageWidth) / 2;
      pdf.addImage(imgData, 'PNG', x, 10, imageWidth, imageHeight);
      pdf.save(`${(user.ticketId || 'ticket')}.pdf`);
    } catch {
      setDownloadError('The ticket could not be downloaded. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return <p className="text-white text-center min-h-screen flex items-center justify-center">Loading ticket...</p>;
  if (!user) return null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#081d22] px-4 py-5 text-white sm:px-6 sm:py-7">
      <div className="pointer-events-none absolute -left-40 top-28 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <header className="relative mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white p-1 shadow-lg">
            <Image src="/logo.jpg" alt="Techember" width={40} height={40} unoptimized className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide">Techember Fest</p>
            <p className="text-xs text-slate-400">Lagos · 2026</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-300 text-xs font-bold text-[#08252B]">{step}</span>
              {step < 3 && <span className="h-px w-8 bg-teal-300/60" />}
            </div>
          ))}
        </div>
      </header>

      <section className="relative mx-auto mt-5 max-w-4xl">
        <div className="mb-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-bold text-teal-200">
            <CheckCircle2 className="h-4 w-4" /> Registration complete
          </span>
          <h1 className="mt-3 text-2xl font-bold sm:text-4xl">Your ticket is ready</h1>
          <p className="mt-2 text-sm text-slate-400">Save or download your ticket for event check-in.</p>
        </div>

        {downloadError && <p role="alert" className="mx-auto mb-4 max-w-md rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-center text-sm text-red-200">{downloadError}</p>}

        <div className="mx-auto max-w-md">
          <div ref={ticketRef} className="relative overflow-hidden rounded-[28px] border border-teal-300/20 bg-[#12343a] p-4 shadow-[0_30px_80px_rgba(0,0,0,.32)] sm:p-5">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#174650] to-[#102f35] p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-300">Admit one</p>
              <h2 className="mt-2 text-2xl font-bold">Techember Fest &apos;26</h2>
              <div className="mt-3 flex flex-col items-center gap-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-teal-300" /> 04 Rumens Road, Ikoyi, Lagos</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-teal-300" /> March 15, 2026 · 7:00 PM</span>
              </div>
            </div>

            <div className="relative mt-4 flex justify-center">
              <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-teal-300/30 bg-[#081f24] shadow-xl sm:h-40 sm:w-40">
                {user.avatar ? (
                  <Image src={user.avatar} alt={`${user.name} avatar`} width={160} height={160} unoptimized className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#081f24] text-5xl font-bold text-teal-300">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-[#081f24] p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">Name</p>
                  <p className="mt-1 truncate text-sm font-bold">{user.name}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">Ticket</p>
                  <p className="mt-1 truncate text-sm font-bold">{ticketType}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">Email</p>
                  <p className="mt-1 truncate text-sm">{user.email}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">Quantity</p>
                  <p className="mt-1 text-sm font-bold">{ticketCount}</p>
                </div>
              </div>
              {user.specialRequest && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">Special request</p>
                  <p className="mt-1 text-sm text-slate-300">{user.specialRequest}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col items-center rounded-2xl bg-white px-4 py-3">
              <svg ref={barcodeRef} className="h-16 w-full"></svg>
              <p className="mt-1 text-[10px] font-bold tracking-[0.16em] text-[#08252B]">{user.ticketId}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => router.push('/form')} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-slate-200 transition hover:bg-white/10">
              <PencilLine className="h-4 w-4" /> Edit details
            </Button>
            <Button onClick={downloadPDF} disabled={isDownloading} className="flex flex-[1.35] items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3.5 font-bold text-[#08252B] shadow-[0_12px_30px_rgba(45,212,191,.14)] transition hover:bg-teal-200">
              {isDownloading ? <TicketIcon className="h-4 w-4 animate-pulse" /> : <Download className="h-4 w-4" />}
              {isDownloading ? 'Preparing PDF...' : 'Download ticket'}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
