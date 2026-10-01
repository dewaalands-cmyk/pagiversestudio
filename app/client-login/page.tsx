"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

function ClientLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    params.get("error") === "unauthorized" ? "Sesi berakhir. Silakan login kembali." : ""
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Email atau password salah. Periksa kembali.");
      return;
    }

    router.push("/client-portal");
    router.refresh();
  }

  return (
    <>
      {error && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-cloud-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus
            autoComplete="email"
            placeholder="nama@email.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-label transition-all focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/60"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-cloud-200">Password</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-slate-label transition-all focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/60"
            />
            <button
              type="button"
              onClick={() => setShowPass((value) => !value)}
              aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-label transition-colors hover:text-white"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-bold text-navy-deep shadow-lg shadow-mint/20 transition-all hover:bg-mint/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" />Memproses...</> : "Masuk ke Portal Klien"}
        </button>
      </form>
    </>
  );
}

export default function ClientLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-deep px-4">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-mint/10 blur-[120px]" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-label transition hover:text-white"><ArrowLeft size={14} />Kembali ke website</Link>
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-mint shadow-lg shadow-mint/30"><span className="text-2xl font-black text-navy-deep">P</span></div>
          <h1 className="text-xl font-bold tracking-tight text-white">Portal Klien</h1>
          <p className="mt-1 text-sm text-slate-label">Pagiverse Studio</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-navy-soft/80 p-8 shadow-2xl backdrop-blur">
          <h2 className="mb-1 text-xl font-bold text-white">Selamat datang kembali</h2>
          <p className="mb-6 text-sm text-slate-label">Lihat progres project dan invoice kamu</p>
          <Suspense fallback={<div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-mint" /></div>}>
            <ClientLoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
