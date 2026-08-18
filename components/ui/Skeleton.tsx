"use client";

import React from "react";

export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#192030]/70 border border-[#273248]/40 ${className}`}
      {...props}
    />
  );
}

export function TournamentCardSkeleton() {
  return (
    <div className="flex flex-col md:flex-row overflow-hidden rounded-2xl border border-[#1E2538] bg-[#0E121C]/80 p-0 shadow-2xl backdrop-blur-md">
      <div className="w-full md:w-64 h-48 md:h-auto shrink-0 bg-[#161C2C] animate-pulse relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="pt-3 space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  );
}

export function LeaderboardSkeletonRow() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 rounded-xl border border-[#1E2538] bg-[#0E121C]/80 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-4 shrink-0">
        <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex flex-col w-full md:w-64 lg:w-80 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
      <div className="flex items-center gap-8 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#1E2333]">
        <div className="space-y-1">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-5 w-10" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function ScrimCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-[#0E121C]/90 border border-[#1E2538] shadow-xl space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#080B12] border border-[#181F30]">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}
