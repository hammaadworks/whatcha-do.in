"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthCodeError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'An unknown error occurred during authentication';

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-br from-red-100 via-red-200 to-red-300 dark:bg-background">
      <div className="relative z-10 p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md border border-red-200 dark:border-red-700">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground">
            Authentication Error
          </h1>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error}
          </p>
          
          <div className="flex flex-col gap-3 w-full pt-4">
            <Link href="/logins" className="w-full">
              <Button className="w-full">
                Try Again
              </Button>
            </Link>
            
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
