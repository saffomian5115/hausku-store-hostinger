import { type NextRequest } from "next/server";
import { getSessionCustomer, type SessionCustomer } from "@/lib/customerSession";

export type SessionUser = SessionCustomer;

/**
 * Extracts the current user from the signed `session` cookie.
 * Returns null if not logged in or the session is expired/forged.
 *
 * Thin wrapper around the shared verifier in customerSession.ts so every
 * consumer of the customer session uses one consistent implementation.
 */
export function getSessionUser(request: NextRequest): SessionUser | null {
  return getSessionCustomer(request);
}
