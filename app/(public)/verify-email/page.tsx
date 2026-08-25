"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { CheckCircleIcon, AlertTriangleIcon } from "@/components/ui/Icons";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "error">(() =>
    token ? "verifying" : "error",
  );

  useEffect(() => {
    if (!token) return;

    authService
      .verifyEmail(token)
      .then(async (res) => {
        await loginWithToken(res.access_token);
        router.push("/dashboard");
      })
      .catch(() => {
        setStatus("error");
      });
    // Only ever run once per token — loginWithToken/router are stable app-level refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (status === "error") {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 bg-background">
        <div className="p-8 rounded-2xl bg-card-bg border border-raised-panel text-center max-w-sm w-full space-y-4 shadow-2xl">
          <AlertTriangleIcon className="w-10 h-10 text-error mx-auto" />
          <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
            Link Invalid or Expired
          </h2>
          <p className="text-xs font-sans text-secondary-text">
            This verification link no longer works. Register again to get a fresh one, or use the resend
            option on the registration page.
          </p>
          <Link
            href="/register"
            className="inline-flex h-10 px-5 rounded-lg game-theme-btn font-sans text-xs font-bold uppercase tracking-wider items-center justify-center"
          >
            Back to Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 bg-background">
      <div className="p-8 rounded-2xl bg-card-bg border border-raised-panel text-center max-w-sm w-full space-y-4 shadow-2xl">
        <CheckCircleIcon className="w-10 h-10 text-success mx-auto" />
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
          Verifying Your Email
        </h2>
        <p className="text-xs font-sans text-secondary-text">
          Hang on while we confirm your account...
        </p>
        <div className="w-8 h-8 border-2 border-primary-brand/30 border-t-primary-brand rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-xs font-sans text-secondary-text">
          Verifying account...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
