"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const errorParam = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    errorParam === "unauthorized" ? "Akses ditolak. Silakan login ulang." : ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email atau password salah. Periksa kembali.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <>
      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-cloud-200 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="admin@pagiversestudio.com"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-label focus:outline-none focus:ring-2 focus:ring-mint/60 focus:border-mint transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-cloud-200 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-label focus:outline-none focus:ring-2 focus:ring-mint/60 focus:border-mint transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-label hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-mint hover:bg-mint/90 disabled:opacity-50 disabled:cursor-not-allowed text-navy-deep font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-mint/20"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Memproses...
            </>
          ) : (
            "Masuk ke Dashboard"
          )}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-navy-deep grid-pattern flex items-center justify-center px-4">
      {/* Glow accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-mint/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-mint flex items-center justify-center mb-4 shadow-lg shadow-mint/30">
            <span className="text-navy-deep font-black text-2xl">P</span>
          </div>
          <h2 className="text-white font-bold text-xl tracking-tight">
            Pagiverse Studio
          </h2>
          <p className="text-slate-label text-sm mt-1">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-navy-soft/80 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-white mb-1">Selamat datang</h1>
          <p className="text-slate-label text-sm mb-6">
            Masuk untuk mengelola website & klien
          </p>

          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Loader2 size={22} className="animate-spin text-mint" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-slate-label mt-6">
          © {new Date().getFullYear()} Pagiverse Studio · All rights reserved
        </p>
      </div>
    </div>
  );
}
