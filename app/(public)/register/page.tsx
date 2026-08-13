"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
  const isEduPh = email.toLowerCase().endsWith(".edu.ph");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Please enter your display name.");
      return;
    }

    if (!email.trim() || !isEduPh) {
      setError("Registration requires a valid Philippine institutional email (.edu.ph).");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const userSession = {
        displayName,
        email,
        university: detectedUniversity || "University of Makati",
        role: "ATHLETE",
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("collegium_user_session", JSON.stringify(userSession));
      setIsLoading(false);
      router.push("/team/create");
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md bg-card-bg border border-raised-panel rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-brand/10 text-primary-brand mb-3 border border-primary-brand/20">
            <span className="font-display text-xl font-bold">C</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wider text-foreground">
            Athlete Registration
          </h1>
          <p className="font-sans text-xs sm:text-sm text-secondary-text mt-1">
            Philippine Collegiate Esports Circuit (.edu.ph required)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
              Full Name / Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Christian Baldesco"
              className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border focus:border-primary-brand text-foreground text-sm font-sans focus:outline-none transition-colors"
            />
          </div>

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
                  ✓ Verified: {detectedUniversity}
                </span>
                <span className="text-[10px] font-sans font-bold bg-success/20 text-success px-2 py-0.5 rounded">
                  ATHLETE ROLE
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border focus:border-primary-brand text-foreground text-sm font-sans focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border focus:border-primary-brand text-foreground text-sm font-sans focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg bg-primary-brand hover:bg-primary-brand/90 text-foreground font-sans text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Athlete Account"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs font-sans text-secondary-text">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-brand hover:underline font-semibold">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
