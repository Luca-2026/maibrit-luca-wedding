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
  "salt": "P6wWcGJQp4ubsLP5VbaUPA==",
  "iv": "1jvAeQZlh0OIM7aA",
  "ciphertext": "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",
  "iterations": 250000
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
