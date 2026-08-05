"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : authError.message
      );
      setIsLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div
      className="relative z-10 w-full max-w-[400px] mx-4 animate-fade-slide"
      style={{
        background: "rgba(27, 32, 36, 0.7)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-modal)",
        boxShadow: "var(--shadow-elevated)",
        padding: "40px",
      }}
    >
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent-primary)" }}
          >
            <Zap className="w-5 h-5" style={{ color: "#003919" }} />
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Pixel & Paper
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              Operations Console
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Sign in to your workspace
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
              className={cn(
                "w-full h-11 px-3 text-sm rounded-input transition-all",
                "placeholder:text-[var(--text-disabled)]",
                "focus:outline-none"
              )}
              style={{
                background: "var(--bg-primary)",
                border: error ? "1px solid var(--status-danger)" : "1px solid var(--border-strong)",
                borderRadius: "var(--radius-input)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent-primary)";
                e.target.style.boxShadow = "0 0 0 2px rgba(74,222,128,0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error ? "var(--status-danger)" : "var(--border-strong)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full h-11 px-3 pr-11 text-sm rounded-input transition-all",
                  "placeholder:text-[var(--text-disabled)]",
                  "focus:outline-none"
                )}
                style={{
                  background: "var(--bg-primary)",
                  border: error ? "1px solid var(--status-danger)" : "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-input)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--accent-primary)";
                  e.target.style.boxShadow = "0 0 0 2px rgba(74,222,128,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? "var(--status-danger)" : "var(--border-strong)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                style={{ color: "var(--text-muted)" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mt-4 px-3 py-2.5 rounded-lg text-sm flex items-start gap-2"
            style={{
              background: "rgba(248, 113, 113, 0.1)",
              border: "1px solid rgba(248, 113, 113, 0.2)",
              color: "var(--status-danger)",
            }}
            role="alert"
          >
            <span className="mt-0.5 flex-shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="mt-6 w-full h-11 font-medium text-sm rounded-button transition-all flex items-center justify-center gap-2"
          style={{
            background: isLoading || !email || !password
              ? "rgba(74,222,128,0.4)"
              : "var(--accent-primary)",
            color: "#003919",
            borderRadius: "var(--radius-button)",
            cursor: isLoading || !email || !password ? "not-allowed" : "pointer",
            transition: "all 200ms cubic-bezier(0.2,0.8,0.2,1)",
          }}
        >
          {isLoading ? (
            <>
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full"
                style={{
                  borderColor: "#003919",
                  borderTopColor: "transparent",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-xs" style={{ color: "var(--text-disabled)" }}>
        Internal tool — Pixel & Paper Agency
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}>
      
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(96,165,250,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
