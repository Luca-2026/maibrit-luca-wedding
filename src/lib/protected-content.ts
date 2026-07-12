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
  salt: "7sDbsxsMnVIz02KGeKJNLQ==",
  iv: "tW+7kV+KSxa/05VG",
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
