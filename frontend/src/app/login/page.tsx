'use client';

// 'use client' tells Next.js this component runs in the browser (not on the server).
// We need it because we use useState, useRouter, and event handlers.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();

  // Form state — one piece of state per input field
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); // Stop the browser from reloading the page
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Persist token + user in localStorage so other pages can read them
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));

      router.push('/chat');
    } catch {
      setError('Cannot reach the server. Is the backend running on port 4000?');
    } finally {
      setLoading(false);
    }
  }

  return (
    // Full-screen gradient background — indigo-50 → white → violet-50
    // gives a soft, modern feel without being distracting
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ── Brand header ───────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <MessageSquare className="size-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Sign in to continue chatting
          </p>
        </div>

        {/* ── Form card ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

            {/* Error banner — only shown when there's an error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100 animate-fade-in"
              >
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150"
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150"
              />
            </div>

            {/* Submit button — shows spinner while loading */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors duration-150 shadow-sm cursor-pointer"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
