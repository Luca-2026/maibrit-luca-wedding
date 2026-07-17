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
  "salt": "umIgy1YesLZR0duFmfMdBg==",
  "iv": "UvB3oNOALCHwQkgW",
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
