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
  salt: "MRnJj6AeVqFqeqAJAgYZDg==",
  iv: "B6gJ493wOWYaZTIe",
  ciphertext:
    "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[REDACTED_FOR_BREVITY]",
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
