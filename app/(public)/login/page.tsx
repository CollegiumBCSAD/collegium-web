"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const getUniversityFromEmail = (emailStr: string) => {
    const domain = emailStr.split("@")[1]?.toLowerCase() || "";
    if (domain === "umak.edu.ph") return "University of Makati (UMAK)";
    if (domain === "ust.edu.ph") return "University of Santo Tomas (UST)";
    if (domain === "dlsu.edu.ph") return "De La Salle University (DLSU)";
    if (domain === "admu.edu.ph") return "Ateneo de Manila University (ADMU)";
    if (domain === "up.edu.ph") return "University of the Philippines (UP)";
    if (domain.endsWith(".edu.ph")) return `${domain.split(".")[0].toUpperCase()} University`;
    return null;
  };

  const detectedUniversity = getUniversityFromEmail(email);

  const handleGoogleAuth = () => {
    setIsGoogleLoading(true);
    setError("");
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    window.location.href = `${backendUrl}/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your institutional email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post<{ access_token: string }>(
        "/auth/login",
        { email: email.trim(), password },
        true
      );
      await loginWithToken(res.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-12 game-theme-bg">
      <div className="w-full max-w-md bg-card-bg border border-raised-panel rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-brand/10 text-primary-brand mb-3 border border-primary-brand/20">
            <span className="font-display text-xl font-bold">C</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wider text-foreground">
            Athlete Log In
          </h1>
          <p className="font-sans text-xs sm:text-sm text-secondary-text mt-1">
            Access your scrims, tournaments, and team dashboard
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs font-sans">
            {error}
          </div>
        )}

        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading}
            className="w-full h-11 rounded-lg bg-white text-gray-900 hover:bg-gray-100 font-sans text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Institutional Google Account</span>
              </>
            )}
          </button>
          <span className="block text-[10px] font-sans text-secondary-text text-center mt-1.5">
            Auto-verifies institutional .edu.ph Google Workspace domains
          </span>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-raised-panel"></div>
          <span className="flex-shrink mx-4 text-[10px] font-sans text-secondary-text uppercase tracking-widest font-semibold">
            Or Sign In with Email
          </span>
          <div className="flex-grow border-t border-raised-panel"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
              Institutional Email (.edu.ph)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@umak.edu.ph"
              className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border focus:border-primary-brand text-foreground text-sm font-sans focus:outline-none transition-colors"
            />
            {detectedUniversity && (
              <div className="mt-2 p-2.5 rounded bg-success/10 border border-success/30 flex items-center justify-between">
                <span className="text-[11px] font-sans font-semibold text-success uppercase tracking-wider">
                  ✓ {detectedUniversity}
                </span>
                <span className="text-[10px] font-sans font-bold bg-success/20 text-success px-2 py-0.5 rounded">
                  ATHLETE
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-16 rounded-lg bg-background border border-panel-border focus:border-primary-brand text-foreground text-sm font-sans focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans font-semibold text-secondary-text hover:text-foreground transition-colors cursor-pointer select-none px-1.5 py-0.5 rounded hover:bg-white/5"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg game-theme-btn font-sans text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Log In to Athlete Dashboard"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs font-sans text-secondary-text">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-primary-brand hover:underline font-semibold">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
