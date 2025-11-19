"use client";

import Auth from "@/components/auth/Auth";
import { Ripple } from "@/components/ui/ripple"; // Import Ripple component

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-24 overflow-hidden
      bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 dark:bg-background">
      {/* Ripple Background */}
      <Ripple />
      
      {/* Logo - Placeholder for now */}
      <div className="absolute top-8 left-8 flex items-center space-x-2 z-10">
        {/* <img src="/public/ebolt-logo.svg" alt="Ebolt Logo" className="h-8 w-8" /> */}
        <span className="text-2xl font-bold text-gray-800 dark:text-white">whatcha-doin</span>
      </div>

      {/* Central Card for Login Form */}
      <div className="relative z-10 p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <Auth />
      </div>
    </main>
  );
}
