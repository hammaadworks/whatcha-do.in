// app/(main)/layout.tsx

/**
 * @file Next.js App Router layout for the `(main)` route group.
 *       Responsible for layout structure of pages within this group.
 */

// Marks this component as client-side rendered if needed, but for simple pass-through it can be server or client.
// Keeping "use client" if there were other client-side logic, but strictly for children it's not needed.
// However, since the original file had it and imported AuthProvider, we can revert to a simple server component or client component.
// Let's keep it simple.

import React from "react";

/**
 * MainLayout Component
 *
 * Wraps child pages/components within the `(main)` route group.
 * Note: AuthProvider is already provided by the RootLayout.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child elements (pages or nested layouts)
 *        to be rendered within this layout.
 * @returns {JSX.Element} A React element.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
