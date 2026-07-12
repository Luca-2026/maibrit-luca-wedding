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
  salt: "viKjeJ86rJQ+GWfdyl7OQQ==",
  iv: "esL0i750llEEdUKq",
  ciphertext: "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",
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
