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
  "salt": "3d8v5fGw4bAPt+NNJi86Rg==",
  "iv": "1I6GO7hOF+gW2NT1",
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
