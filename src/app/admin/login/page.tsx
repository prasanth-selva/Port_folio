"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const rateLimited = params?.get("e") === "rate";
  const [error, setError] = useState<string | null>(
    rateLimited ? "Too many attempts. Wait 10 minutes and try again." : null
  );
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await signIn("credentials", {
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid credentials.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85 placeholder:text-white/25 outline-none transition-colors focus:border-accent-cyan/50";

  return (
    <div className="grid min-h-screen place-items-center bg-base px-6">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="glass relative w-full max-w-sm rounded-2xl p-8">
        <p className="mono-label mb-2">/ RESTRICTED AREA</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">
          Admin access
        </h1>
        <p className="mt-1.5 font-mono text-xs text-white/40">
          Single-operator access. Sign-in attempts are rate-limited.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mono-label mb-2 block">Email</label>
            <input id="email" name="email" type="email" required autoComplete="username" className={inputCls} placeholder="admin@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="mono-label mb-2 block">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" className={inputCls} placeholder="••••••••••••" />
          </div>

          {error && (
            <p className="rounded-xl border border-red-400/25 bg-red-400/[0.06] px-4 py-3 font-mono text-xs text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent-cyan px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black transition-all hover:shadow-glow-sm disabled:opacity-50"
          >
            {loading ? "AUTHENTICATING…" : "AUTHENTICATE →"}
          </button>
        </form>

        <a href="/" className="mt-6 block text-center font-mono text-[11px] tracking-[0.2em] text-white/30 transition-colors hover:text-white/60">
          ← BACK TO SITE
        </a>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
