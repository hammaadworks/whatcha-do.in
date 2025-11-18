"use client"; // Make this a client component

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import React, { useState, useEffect } from 'react'; // Import useState and useEffect

export default function NotFound() {
  const characters = ['0', 'x', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', 'X', '?', '/', '\\', '|', '{', '}', '[', ']', '<', '>', '~', '`', '+', '-', '=', ';', ':', ',', '.', '<', '>'];
  const [animatedChar, setAnimatedChar] = useState('0');

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * characters.length);
      setAnimatedChar(characters[randomIndex]);
    }, 1300); // Change character every 200ms

    return () => clearInterval(interval); // Cleanup on unmount
  }, [characters]);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background p-4 font-mono">
      {/* Logo */}
      <div className="absolute top-8 left-8 flex items-center space-x-2 z-10">
        <span className="text-2xl font-bold text-gray-800 dark:text-white">whatcha-doin</span>
      </div>

      <div className="absolute top-4 right-4"> {/* Positioned top-right */}
        <AnimatedThemeToggler />
      </div>
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="mb-4 flex items-baseline font-mono">
          <span className="font-bold text-8xl text-primary md:text-9xl">4</span>
          <div className="relative mx-2">
            <span className="cycling-digit animate-pulse font-bold text-8xl text-primary md:text-9xl">
              {animatedChar}
            </span>
            <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-xl"></div>
          </div>
          <span className="font-bold text-8xl text-primary md:text-9xl">4</span>
        </div>
        <div className="mb-4 h-px w-16 bg-border"></div>
        <h1 className="mb-2 text-center text-2xl font-bold md:text-3xl">Page Not Found</h1>
        <p className="mb-8 text-center text-muted-foreground">We&apos;ve lost this page in the data stream.</p>
        <div className="flex w-full max-w-xs flex-col gap-4 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/dashboard">
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
