"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function PublicTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div
      key={pathname}
      className={`flex flex-col flex-1 w-full ${
        isHome ? "animate-home-entrance" : "animate-page-slide-in"
      }`}
    >
      {children}
    </div>
  );
}
