"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { TrophyIcon, UsersIcon, ShieldIcon, ZapIcon, CheckCircleIcon, AlertTriangleIcon } from "@/components/ui/Icons";

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithToken } = useAuth();

  // Role Selection: "ATHLETE" (registered as NON_ATHLETE until joining roster) vs "ORGANIZER" (Instant Tournament Host)
  const [accountType, setAccountType] = useState<"ATHLETE" | "ORGANIZER">("ATHLETE");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const isEduPh = email.toLowerCase().includes("@") && email.toLowerCase().split("@")[1]?.endsWith(".edu.ph");

  const handleGoogleAuth = () => {
    setIsGoogleLoading(true);
    setError("");
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    window.location.href = `${backendUrl}/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError(accountType === "ORGANIZER" ? "Please enter your organizer or coordinator name." : "Please enter your display name.");
      return;
    }
    if (!isEduPh) {
      setError("Registration requires a valid Philippine institutional email (.edu.ph).");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const finalDisplayName = accountType === "ORGANIZER" && orgName.trim()
        ? `${displayName.trim()} [${orgName.trim()}]`
        : displayName.trim();

      const res = await api.post<{ access_token: string }>(
        "/auth/register",
        {
          displayName: finalDisplayName,
          email: email.trim(),
          password,
          role: accountType === "ORGANIZER" ? "ORGANIZER" : "NON_ATHLETE",
        },
        true
      );
      await loginWithToken(res.access_token);
      
      if (accountType === "ORGANIZER") {
        router.push("/tournaments");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isOrganizer = accountType === "ORGANIZER";

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-10 sm:py-16 game-theme-bg relative overflow-hidden">
      {/* Soft Backlight Aura */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 opacity-20 blur-3xl pointer-events-none rounded-full"
        style={{
          background: isOrganizer
            ? "radial-gradient(circle, #F59E0B 0%, transparent 70%)"
            : "radial-gradient(circle, var(--primary-brand) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-lg bg-[#0D121F]/98 border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative flex flex-col justify-between backdrop-blur-xl overflow-hidden z-10">
        {/* Top Accent Gradient Border */}
        <div 
          className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-300"
          style={{
            background: isOrganizer
              ? "linear-gradient(90deg, transparent 0%, #F59E0B 30%, #F59E0B 70%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, var(--primary-brand) 30%, var(--primary-brand) 70%, transparent 100%)",
            boxShadow: isOrganizer ? "0 0 12px #F59E0B" : "0 0 12px var(--primary-brand)",
          }}
        />

        {/* Account Role Switcher Tabs */}
        <div className="flex border border-[#1C2538] rounded-2xl bg-[#080C14] p-1 gap-2">
          <button
            type="button"
            onClick={() => { setAccountType("ATHLETE"); setError(""); }}
            className={`flex-1 h-11 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-center transition-all cursor-pointer ${
              !isOrganizer
                ? "game-theme-btn shadow-md"
                : "bg-transparent hover:bg-[#141A29] text-slate-400 hover:text-white"
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            <span>Student / Athlete</span>
          </button>

          <button
            type="button"
            onClick={() => { setAccountType("ORGANIZER"); setError(""); }}
            className={`flex-1 h-11 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-center transition-all cursor-pointer ${
              isOrganizer
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black shadow-md"
                : "bg-transparent hover:bg-[#141A29] text-slate-400 hover:text-white"
            }`}
          >
            <TrophyIcon className="w-4 h-4 text-inherit" />
            <span>Tournament Host</span>
          </button>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            {isOrganizer ? (
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                <ShieldIcon className="w-3.5 h-3.5 text-amber-400" />
                // COLLEGIATE TOURNAMENT COMMISSION
              </span>
            ) : (
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-primary-brand flex items-center gap-1">
                <ShieldIcon className="w-3.5 h-3.5 text-primary-brand" />
                // PHILIPPINE COLLEGIATE ESPORTS
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wide text-white">
            {isOrganizer ? "ORGANIZER SIGN UP" : "ATHLETE REGISTRATION"}
          </h1>
          <p className="font-sans text-xs text-slate-400">
            {isOrganizer
              ? "Host tournaments, generate brackets, and verify match logs under your banner."
              : "Register your institutional account to join varsity rosters and compete."}
          </p>
        </div>

        {/* Instant Approval Banner for Organizers */}
        {isOrganizer && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-sans flex items-start gap-2.5 shadow-inner">
            <ZapIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200 block uppercase font-mono text-[11px] tracking-wider">
                Instant Access — No Admin Approval Needed
              </span>
              <p className="text-[11px] text-amber-300/90 mt-0.5 leading-relaxed">
                Sign up with your university email (.edu.ph) for immediate host privileges to create and manage tournaments.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-sans flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google SSO Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading}
            className="w-full h-11 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-sans text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-md disabled:opacity-50"
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
          <span className="block text-[10px] font-sans text-slate-400 text-center mt-1.5">
            Auto-verifies institutional .edu.ph Google Workspace domains
          </span>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#1C2538]"></div>
          <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
            Or Register with Institutional Email
          </span>
          <div className="flex-grow border-t border-[#1C2538]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              {isOrganizer ? "Organizer / Lead Full Name" : "Full Name / Display Name"}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Christian Baldesco"
              className="w-full h-11 px-4 rounded-xl bg-[#080C14] border border-[#1C2538] focus:border-primary-brand text-white text-sm font-sans focus:outline-none transition-colors"
            />
          </div>

          {isOrganizer && (
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Organization / Esports Club Name (Optional)
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. UMAK Esports Alliance"
                className="w-full h-11 px-4 rounded-xl bg-[#080C14] border border-[#1C2538] focus:border-amber-400 text-white text-sm font-sans focus:outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Institutional Email (.edu.ph)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isOrganizer ? "organizer@umak.edu.ph" : "student@umak.edu.ph"}
              className="w-full h-11 px-4 rounded-xl bg-[#080C14] border border-[#1C2538] focus:border-primary-brand text-white text-sm font-sans focus:outline-none transition-colors"
            />
            {detectedUniversity && (
              <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                  {detectedUniversity}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                  isOrganizer
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    : "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                }`}>
                  {isOrganizer ? "TOURNAMENT ORGANIZER" : "STUDENT ATHLETE"}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-16 rounded-xl bg-[#080C14] border border-[#1C2538] focus:border-primary-brand text-white text-sm font-sans focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors cursor-pointer select-none px-1.5 py-0.5 rounded hover:bg-white/5"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-16 rounded-xl bg-[#080C14] border border-[#1C2538] focus:border-primary-brand text-white text-sm font-sans focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors cursor-pointer select-none px-1.5 py-0.5 rounded hover:bg-white/5"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-11 text-xs font-mono font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 rounded-xl ${
                isOrganizer
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20"
                  : "game-theme-btn shadow-md"
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : isOrganizer ? (
                <>
                  <TrophyIcon className="w-4 h-4 text-black" />
                  <span>Create Organizer Account & Access Hub</span>
                </>
              ) : (
                <span>Create Student Athlete Account</span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs font-sans text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="text-primary-brand hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
