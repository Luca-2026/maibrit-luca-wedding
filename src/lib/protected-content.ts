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
  salt: "0pKBJWz2po/2kEmYA5DSgQ==",
  iv: "cYjhv0BoVokwmp2I",
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
