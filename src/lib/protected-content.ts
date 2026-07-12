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
  salt: "4pDSvCZoWsah5T07ktLOzw==",
  iv: "TmoPyS0pp58+gdt9",
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
