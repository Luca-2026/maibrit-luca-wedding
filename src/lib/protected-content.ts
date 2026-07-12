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
  trauzeugen: { name: string; role: string; note?: string }[];
  rsvpDeadline: string;
  contactEmail: string;
  contactPhone: string;
};


export const PROTECTED_PAYLOAD = {
  salt: "Ru+dhX5Vh9xEg3+pjjmdHQ==",
  iv: "Q82Gs4CF1KYEHM8H",
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
