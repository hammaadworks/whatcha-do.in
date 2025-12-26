// app/(main)/layout.tsx

/**
 * @file Next.js App Router layout for the `(main)` route group.
 *       Responsible for providing global authentication context to all pages within this group.
 */

// Marks this component as client-side rendered. Essential for `AuthProvider`
// which likely depends on browser APIs or client-side React hooks for auth state management.
"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";

/**
 * MainLayout Component
 *
 * Wraps child pages/components within the `(main)` route group, providing them
 * with the `AuthProvider` context. This centralizes authentication state management
 * for all routes under `/(main)`.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child elements (pages or nested layouts)
 *        to be rendered within this layout.
 * @returns {JSX.Element} A React element providing the `AuthProvider` context.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
