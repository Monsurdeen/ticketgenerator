import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Upload } from '../components/ui/Upload';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/storage';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Mail, MessageSquareText, ShieldCheck, User } from 'lucide-react';

export default function FormPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [specialRequest, setSpecialRequest] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUser = getFromLocalStorage('ticketUser');
    if (savedUser) {
      setName(savedUser.name || '');
      setEmail(savedUser.email || '');
      setAvatar(savedUser.avatar || null);
      setSpecialRequest(savedUser.specialRequest || '');
    }
  }, []);

  useEffect(() => {
    if (router.isReady && router.query.checkout === 'failed') {
      setError('We could not confirm your Paystack payment. If you were charged, please contact support before trying again.');
    }
  }, [router.isReady, router.query.checkout]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    const userData = {
      name: name.trim(),
      email: email.trim(),
      avatar,
      specialRequest: specialRequest.trim(),
    };
    saveToLocalStorage('ticketUser', userData);
    setIsSubmitting(true);
    setError('');

    try {
      const ticketType = getFromLocalStorage('ticketType') || 'Free';
      const quantity = getFromLocalStorage('selectedTickets') || '1';
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          ticketType,
          quantity,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to create booking');

      if (result.url) {
        window.location.assign(result.url);
      } else if (result.successUrl) {
        router.push(result.successUrl);
      }
    } catch (checkoutError) {
      setError(checkoutError.message || 'Unable to continue to checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#081d22] px-4 py-5 text-white sm:px-6 sm:py-7">
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <header className="relative mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white p-1 shadow-lg">
            <Image src="/logo.jpg" alt="Techember" fill sizes="40px" className="object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide">Techember Fest</p>
            <p className="text-xs text-slate-400">Attendee profile</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step <= 2 ? 'bg-teal-300 text-[#08252B]' : 'border border-white/10 bg-white/5 text-slate-400'}`}>{step}</span>
              {step < 3 && <span className={`h-px w-8 ${step === 1 ? 'bg-teal-300/60' : 'bg-teal-300/40'}`} />}
            </div>
          ))}
        </div>
      </header>

      <section className="relative mx-auto mt-6 max-w-5xl">
        <div className="grid overflow-hidden rounded-[28px] border border-white/10 bg-[#102f35]/80 shadow-2xl shadow-black/20 backdrop-blur lg:grid-cols-[360px_1fr]">
          <aside className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-300">Step 2 of 3</p>
            <h1 className="mt-3 text-3xl font-bold">Create your profile</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">Your details will appear on the digital ticket.</p>

            <div className="mt-7 flex justify-center lg:mt-10">
              <Upload
                initialPreview={avatar}
                onChange={(dataUrl) => {
                  setAvatar(dataUrl);
                  setError('');
                }}
                onError={setError}
              />
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-teal-300/10 bg-teal-300/5 p-4 text-xs leading-5 text-slate-300">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
              Your photo is stored only in this browser and included with your ticket.
            </div>
          </aside>

          <div className="p-6 sm:p-8">
            <div className="grid gap-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Full name <span className="text-teal-300">*</span></span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    className="h-12 rounded-xl border-white/10 bg-[#081f24] pl-11 text-white placeholder:text-slate-600 focus:border-teal-300/50 focus:ring-teal-300/20"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Email address <span className="text-teal-300">*</span></span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="hello@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="h-12 rounded-xl border-white/10 bg-[#081f24] pl-11 text-white placeholder:text-slate-600 focus:border-teal-300/50 focus:ring-teal-300/20"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Special request <span className="font-normal text-slate-500">(optional)</span></span>
                <div className="relative">
                  <MessageSquareText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-500" />
                  <textarea
                    placeholder="Accessibility needs, dietary preferences or a note..."
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    className="h-28 w-full resize-none rounded-xl border border-white/10 bg-[#081f24] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/20"
                  />
                </div>
              </label>

              {error && (
                <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>
              )}

              <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
                <Button onClick={() => router.push('/')} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-slate-200 transition hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 font-bold text-[#08252B] shadow-[0_12px_30px_rgba(45,212,191,.14)] transition hover:bg-teal-200">
                  {isSubmitting ? 'Preparing checkout...' : 'Generate ticket'} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
