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
  salt: "QY5xG9kcMogjJycoEMwvDw==",
  iv: "RTaxuTnhPpX4XhnO",
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
