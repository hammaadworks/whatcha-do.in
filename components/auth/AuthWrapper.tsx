"use client";

import dynamic from "next/dynamic";

const Auth = dynamic(() => import("@/components/auth/Auth"), { ssr: false });

export default function AuthWrapper() {
  return <Auth />;
}
