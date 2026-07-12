/**
 * Verschlüsselte Details der Hochzeit.
 *
 * Diese Datei enthält Adressen, exakten Ablauf, Hotels und Kontaktdaten
 * als AES-GCM-Chiffrat. Ohne das gemeinsame Gäste-Passwort ist der Inhalt
 * kryptografisch unlesbar — auch für jeden, der den Client-Bundle
 * herunterlädt. Damit ist die Seite auch auf einem statischen
 * LiteSpeed-Webserver security-konform gegen unbefugten Zugriff.
 *
 * ─────────── Passwort ändern / Inhalt aktualisieren ───────────
 * 1. Skript `scripts/encrypt-content.mjs` bearbeiten (Inhalt + Passwort)
 * 2. `PW='neuesPasswort' node scripts/encrypt-content.mjs` ausführen
 * 3. Die JSON-Ausgabe hier in `PROTECTED_PAYLOAD` einsetzen
 *
 * Aktueller Zugangscode: "diesandhoffs"
 * ⚠︎ Vor Versand der Einladungen ggf. anpassen und neu verschlüsseln.
 */

export type ProtectedContent = {
  ablauf: { time: string; title: string; where: string }[];
  locations: {
    label: string;
    name: string;
    addressLines: string[];
    maps: string;
    note: string;
  }[];
  hotels: { name: string; description: string; distance: string; url: string }[];
  rsvpDeadline: string;
  contactEmail: string;
};

export const PROTECTED_PAYLOAD = {
  salt: "OiY44wGXyTv6pwwLOcLzvQ==",
  iv: "1gChfkZnCbWm7Jy6",
  ciphertext:
    "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",
  iterations: 250000,
} as const;

function b64ToBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

export async function decryptContent(password: string): Promise<ProtectedContent> {
  const enc = new TextEncoder();
  const salt = b64ToBuffer(PROTECTED_PAYLOAD.salt);
  const iv = b64ToBuffer(PROTECTED_PAYLOAD.iv);
  const ct = b64ToBuffer(PROTECTED_PAYLOAD.ciphertext);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PROTECTED_PAYLOAD.iterations,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  // Throws DOMException (OperationError) on wrong password — auth-tag failure.
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return JSON.parse(new TextDecoder().decode(plain)) as ProtectedContent;
}
