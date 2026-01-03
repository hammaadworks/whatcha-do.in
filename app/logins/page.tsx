import Logins from "@/packages/auth/components/Logins";
import { Suspense } from "react";

/**
 * The Login/Signup page.
 * Renders the authentication interface.
 */
export default function LoginPage() {
  return (
    <div className="flex-grow flex items-center justify-center">
      <Suspense fallback={null}>
        <Logins />
      </Suspense>
    </div>
  );
}
