"use client";

import React from "react";
import AppHeader from "@/components/layout/AppHeader"; // Import AppHeader

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-grow items-center justify-center">
        {children}
      </div>
    </div>
  );
}
