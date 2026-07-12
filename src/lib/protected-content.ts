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
  salt: "pyqFEZUsdRS7d8+wcn7ZiQ==",
  iv: "COBDq+VrH5kOYQ0q",
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
