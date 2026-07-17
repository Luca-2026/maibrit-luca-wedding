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
  salt: "RezSF+VHmnQSWDyjSyJysg==",
  iv: "DZ+1RycDiOfQRzN7",
  ciphertext: "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",
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
