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
  "salt": "Kr7frZUOnyKG/z8PvPP/sA==",
  "iv": "4Fc5iA8cHlg4F/cY",
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
