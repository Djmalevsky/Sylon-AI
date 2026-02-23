"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f5fa" }}>
      <div className="w-full max-w-[420px] px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <span className="text-xl font-bold" style={{ color: "#1a1a2e" }}>Sylon AI</span>
          </div>
          <p className="text-sm text-gray-400">Sign in to your dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <form onSubmit={handleLogin}>
            {error && (
              <div className="rounded-lg px-4 py-2.5 mb-4 text-xs font-semibold" style={{ backgroundColor: "#e74c3c10", color: "#e74c3c", border: "1px solid #e74c3c20" }}>
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.com"
                className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-purple-400"
                style={{ borderColor: "#e8e8ef" }}
                autoComplete="email"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-purple-400"
                  style={{ borderColor: "#e8e8ef" }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{
                backgroundColor: loading ? "#999" : "#6C5CE7",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(108,92,231,0.25)",
              }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold" style={{ color: "#6C5CE7" }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
