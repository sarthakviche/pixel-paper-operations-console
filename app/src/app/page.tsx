import { redirect } from "next/navigation";

/**
 * Root page — redirects to dashboard.
 * The middleware handles the auth check; if not authenticated, it redirects to /login.
 */
export default function RootPage() {
  redirect("/dashboard");
}
