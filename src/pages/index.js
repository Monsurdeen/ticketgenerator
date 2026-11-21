import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '../components/ui/button';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/storage';
import Image from 'next/image';
import { ArrowRight, CalendarDays, Check, MapPin, Ticket } from 'lucide-react';


export default function Home() {
  const router = useRouter();
  const [ticketType, setTicketType] = useState('Free');
  const [selectedTickets, setSelectedTickets] = useState('1');

  useEffect(() => {
    setTicketType(getFromLocalStorage('ticketType') || 'Free');
    setSelectedTickets(String(getFromLocalStorage('selectedTickets') || '1'));
  }, []);

  const handleNext = () => {
    saveToLocalStorage('ticketType', ticketType);
    saveToLocalStorage('selectedTickets', selectedTickets);
    router.push('/form');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#081d22] px-4 pb-10 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-40 top-32 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <header className="relative mx-auto flex max-w-5xl items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white p-1 shadow-lg">
            <Image src="/logo.jpg" alt="Techember" fill sizes="40px" className="object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide">Techember Fest</p>
            <p className="text-xs text-slate-400">Lagos · 2026</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step === 1 ? 'bg-teal-400 text-[#08252B] shadow-[0_0_20px_rgba(45,212,191,.25)]' : 'border border-white/10 bg-white/5 text-slate-400'}`}>
                {step}
              </span>
              {step < 3 && <span className={`h-px w-8 ${step === 1 ? 'bg-teal-400/60' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>
      </header>

      <section className="relative mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl pt-5 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-teal-300">Attendee registration</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Choose your ticket</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Select the experience that suits you and continue to complete your profile.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#102f35]/80 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
            <div className="relative overflow-hidden rounded-2xl border border-teal-300/10 bg-gradient-to-br from-[#174650] to-[#12343a] p-6">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-teal-300/10 blur-2xl" />
              <div className="relative">
                <span className="mb-4 inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-200">Live in Lagos</span>
                <h2 className="text-2xl font-bold sm:text-3xl">Techember Fest &apos;26</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">A gathering for developers, designers and technology leaders shaping what comes next.</p>
                <div className="mt-5 flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:gap-5">
                  <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-teal-300" /> Mar 15, 2026 · 7:00 PM</span>
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-teal-300" /> Ikoyi, Lagos</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-200">Ticket type</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { type: 'Free', price: 'Free', detail: 'Regular access' },
                  { type: '$150 VIP', price: '$150', detail: 'VIP access' },
                  { type: '$150 VVIP', price: '$150', detail: 'VVIP access' },
                ].map((ticket) => {
                  const selected = ticketType === ticket.type;
                  return (
                    <button
                      key={ticket.type}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setTicketType(ticket.type)}
                      className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${selected ? 'border-teal-300 bg-teal-300/10 shadow-[0_10px_30px_rgba(45,212,191,.08)]' : 'border-white/10 bg-[#0b292f] hover:border-white/20 hover:bg-[#12343a]'}`}
                    >
                      {selected && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal-300 text-[#08252B]"><Check className="h-3 w-3" /></span>}
                      <Ticket className={`h-5 w-5 ${selected ? 'text-teal-300' : 'text-slate-500'}`} />
                      <p className="mt-4 text-lg font-bold">{ticket.price}</p>
                      <p className="mt-1 text-xs text-slate-400">{ticket.detail}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="flex flex-col rounded-[28px] border border-white/10 bg-[#102f35]/80 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
            <h3 className="text-sm font-semibold text-slate-200">Quantity</h3>
            <p className="mt-1 text-sm text-slate-400">How many tickets would you like?</p>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSelectedTickets(String(num))}
                  className={`h-12 rounded-xl border text-sm font-bold transition ${selectedTickets === String(num) ? 'border-teal-300 bg-teal-300 text-[#08252B]' : 'border-white/10 bg-[#0b292f] text-slate-300 hover:border-white/20'}`}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#081f24] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Selection</span>
                <span className="font-semibold">{ticketType}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                <span className="text-slate-400">Tickets</span>
                <span className="font-semibold">{selectedTickets}</span>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <Button
                onClick={handleNext}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-6 py-3.5 font-bold text-[#08252B] shadow-[0_12px_30px_rgba(45,212,191,.16)] transition hover:bg-teal-200"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
