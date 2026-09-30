import "server-only";
import { prisma } from "@/lib/db/prisma";
import {
  generateTotpSecret,
  otpauthUrl,
  totpCode,
  verifyTotp,
} from "@/lib/totp";

/**
 * Admin 2FA state lives in dedicated `settings` rows — deliberately NOT part
 * of StoreSettings: getStoreSettings() is served publicly via GET /api/settings
 * and must never leak the TOTP secret. These helpers read the raw table instead.
 */

const KEY = {
  enabled: "admin_2fa_enabled",
  secret: "admin_2fa_secret",
  pending: "admin_2fa_pending_secret",
};

async function getRaw(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

async function setRaw(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

async function delRaw(key: string): Promise<void> {
  await prisma.setting.deleteMany({ where: { key } });
}

export async function get2faState(): Promise<{
  enabled: boolean;
  pending: boolean;
}> {
  const [enabled, pending] = await Promise.all([
    getRaw(KEY.enabled),
    getRaw(KEY.pending),
  ]);
  return { enabled: enabled === "true", pending: Boolean(pending) };
}

export async function is2faRequired(): Promise<boolean> {
  return (await getRaw(KEY.enabled)) === "true";
}

/** Begin enrollment: generate a secret and hold it as pending until confirmed. */
export async function begin2faSetup(
  account: string
): Promise<{ secret: string; otpauth: string; previewCode: string }> {
  const secret = generateTotpSecret();
  await setRaw(KEY.pending, secret);
  return {
    secret,
    otpauth: otpauthUrl(secret, account),
    // So the admin can sanity-check the entry without their own app yet.
    previewCode: totpCode(secret, Math.floor(Date.now() / 1000 / 30)),
  };
}

/**
 * Confirm enrollment with a live code from the admin's authenticator app.
 * Only then is 2FA armed — a typo can never lock the admin out.
 */
export async function confirm2faSetup(code: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const pending = await getRaw(KEY.pending);
  if (!pending) return { ok: false, error: "Keine ausstehende 2FA-Einrichtung." };

  if (!verifyTotp(pending, code)) {
    return { ok: false, error: "Code falsch — bitte aktuellen 6-stelligen Code eingeben." };
  }

  await setRaw(KEY.enabled, "true");
  await setRaw(KEY.secret, pending);
  await delRaw(KEY.pending);
  return { ok: true };
}

/** Disable 2FA (requires a valid current code — see route). */
export async function disable2fa(code: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const secret = await getRaw(KEY.secret);
  if (!secret) return { ok: false, error: "2FA ist nicht aktiv." };

  if (!verifyTotp(secret, code)) {
    return { ok: false, error: "Code falsch — 2FA wurde NICHT deaktiviert." };
  }

  await delRaw(KEY.enabled);
  await delRaw(KEY.secret);
  await delRaw(KEY.pending);
  return { ok: true };
}

/** The stored secret for an enabled enrollment (null when 2FA is off). */
export async function get2faSecret(): Promise<string | null> {
  return getRaw(KEY.secret);
}

/** True when a login presented email+password correctly but still owes a TOTP code. */
export async function loginRequires2fa(): Promise<boolean> {
  return is2faRequired();
}

/**
 * Verify a login code. Accepts the enrolled app secret AND — as a documented
 * break-glass recovery path (docs/HANDOVER.md §5) — `ADMIN_TOTP_SECRET` env,
 * so the admin can still log in if the DB is unreachable or the secret row
 * was rotated out from under the app.
 */
export async function verifyLogin2fa(code: string): Promise<boolean> {
  const secret = await getRaw(KEY.secret);
  if (secret && verifyTotp(secret, code)) return true;

  const fallback = process.env.ADMIN_TOTP_SECRET;
  if (fallback && verifyTotp(fallback, code)) return true;

  return false;
}
