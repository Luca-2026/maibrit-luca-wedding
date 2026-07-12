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
  hotels: { name: string; distance: string; url: string }[];
  rsvpDeadline: string;
  contactEmail: string;
};

export const PROTECTED_PAYLOAD = {
  salt: "ITkP5diuK+12fSm6X1JIQg==",
  iv: "c8CLRIFY6VImJkEC",
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
