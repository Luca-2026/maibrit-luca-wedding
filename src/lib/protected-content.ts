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
 * Aktuelles Platzhalter-Passwort: "wachtberg2026"
 * ⚠︎ Vor Versand der Einladungen ein starkes Passwort setzen.
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
  salt: "m0IX1PAZjxvHtaf87E5NPg==",
  iv: "hGJjOrRXEhgIfDZt",
  ciphertext:
    "2WxPRokECICo83uTxWp4H273ql2At8+b25YGFRshADZ0RQiFPOavX9FKnkKPe6Y6kLI5zxchskLYIZOifZqEw0ftWbEdeeG8nOh8x4Kjx6Y5dGfOomq5BsRQfbhlS2MEqHEy33sQnRjMjbdWHDTQiAUv9arzR6caxif48h6IwSgRUASgxge9oZdkmQPAU7Ik6Dq6Giegsorr88ugYmSdBmynZ91BiaYgIcq7uEk1aWP9FOHihlFIMZVzfOwi2+iICVjUsH/E5siCnuYwgbVfHi7ERvcRVm2oio0MF9cJl6iP0bK3VLmjXyGdu3jzC8uSp0wycO/XaXYUI7C5r3mw+QtHak2e61Ih5/NBYp05RECwpXbRHIJBUiLzoMWktHdk/gN71sM6GkmlTfjXM1xSEjrWbb8zipboyvDV+xv2aDMwYcKviP21dzilx8MGCgNaFU+BDkfTaIjEzC/mbAdLUTvaib2SYRvBxsH/CiejBOtf6Tm/2WGF4kjrjzIlzA1CLQ40bBrDOUnTX/7U8lCHL+OxOHCn5usn6B2LrXJUnmuQLE7pzAazszgHVqrSw01J6YujmAFRkekpsbNjm1OL6+6dNEMlFxhpkVMgEKn9g3RtGTRN4gwhVnPDsZ3K1jwWu7D4tKZx/MPBXk5I4dxiQ6v6FVRf0VFzRtIOKUiaH3Aoe2f5UEutTXASwVI/wPty68aF9sKREUfbDjjsaYIuUDCSYUBG856Sc+xUVURQsaQw47d4A3T/C9jZuEzBIwpyyEN5HKtFWe587XIWFU2iTEl6gJdQWw3q9S4y17Vnp180HZbNQnFiBkbUuiDTluBQo+a9xgVwxn5Xthx3xurQNa+G3HxfbR+FCe56OOkz/tOqjHl/74kT88NxlyJEXgDbq8UMfJZkIjVUbNqYAeU+YSo3BdUwg6eYQ5C9xAUbKJpW/nVo6iyJubtUIRzWpxvnrB2A67GLuTlnB9+iWnZHPDeY21WHrjZgj294Ad69GLO/VDIO6gQp+tht4OopJdhNir0ONyATwY4HrTucviVTfe1CwE1EFr8rIlXs1Qhnj7akxprYrl7z4Vb7RhSl2QEFvgyZ6PmgLGy5gtgPrQQ2nD1dGynaYB7srGJ4umA4Q3RsWoBHoZSGOFk6XsowVCxrVbnq6sAFGimCQeVzzJlG54qgEMdc3gqu/QK4LGApAlA+L/NcFZzvTxWaeoqQw6w3/IkXE4kWwJFjqN/6XpIYvWfobt0lnBdkubeaTtZBhBo8X7xI416YI3sNCPQpFAsB/QehFQWsNzkRhoWyl+WcnSVjbEBVXPYRtQCZVWrUNBD6",
  iterations: 250000,
} as const;

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function decryptContent(password: string): Promise<ProtectedContent> {
  const enc = new TextEncoder();
  const salt = b64ToBytes(PROTECTED_PAYLOAD.salt);
  const iv = b64ToBytes(PROTECTED_PAYLOAD.iv);
  const ct = b64ToBytes(PROTECTED_PAYLOAD.ciphertext);

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
