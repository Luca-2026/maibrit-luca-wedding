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
  salt: "FQq+X5KMhmUkfYDkyhSYlA==",
  iv: "IC3DCbsZ/1DDVMtI",
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
