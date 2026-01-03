"use client";

import dynamic from "next/dynamic";

const Auth = dynamic(() => import("@/packages/auth/components/Auth"), { ssr: false });

export default function AuthWrapper() {
  return <Auth />;
}
