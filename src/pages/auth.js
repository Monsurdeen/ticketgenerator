import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Mail, Ticket } from 'lucide-react';
import { createBrowserSupabase } from '../lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const supabase = createBrowserSupabase();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace(router.query.next || '/');
      }
    });
  }, [router.isReady, router]);

  const sendLink = async () => {
    setError('');
    setStatus('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    setIsSending(true);
    try {
      const supabase = createBrowserSupabase();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const next = typeof router.query.next === 'string' ? router.query.next : '/';
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${appUrl}${next}` },
      });
      if (signInError) throw signInError;
      setStatus('Check your email for your secure sign-in link.');
    } catch (signInError) {
      setError(signInError.message || 'Unable to send sign-in link.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#081d22] px-4 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#102f35]/90 p-6 shadow-2xl sm:p-8">
        <button type="button" onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-300 text-[#08252B]">
          <Ticket className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-3xl font-bold">Access your ticket</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Sign in with a secure link sent to your email.</p>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-semibold">Email address</span>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && sendLink()}
              placeholder="you@example.com"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#081f24] pl-11 pr-4 outline-none placeholder:text-slate-600 focus:border-teal-300/50"
            />
          </div>
        </label>

        {error && <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        {status && <p role="status" className="mt-4 rounded-xl border border-teal-300/20 bg-teal-300/10 px-4 py-3 text-sm text-teal-100">{status}</p>}

        <button
          type="button"
          onClick={sendLink}
          disabled={isSending}
          className="mt-5 h-12 w-full rounded-xl bg-teal-300 font-bold text-[#08252B] disabled:opacity-60"
        >
          {isSending ? 'Sending...' : 'Send secure link'}
        </button>
      </div>
    </main>
  );
}
