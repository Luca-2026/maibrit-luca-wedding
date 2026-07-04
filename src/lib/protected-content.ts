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
  salt: "vhezATzCnI6s0HeJsbo7DA==",
  iv: "SEyRd1gp06pHUS6s",
  ciphertext:
    "ZGhCRApamDC7Ns9TC0QKb9SopSAK2oo+BQRH0TqyIUJLKKZYltQeO6sOS6Fv6nRJb2gZtoAk4s64GzwDZgrqyHU7ZwpQkq28MwUGPHbqY5I7O7GDfZjsHs0gi/TTMnZrQyM8e4vGY/YJB86z7dgnFa3HoWMLDEAcdQjLd+RLVZctB+aifv1PJiD+whtM1xYoGcoD+0lV2TRaxR7zqJAVnCEYy3BeE2YHcdGZltqNe6dI8n0XfICkjsVmyhsUwrTwsgoELBUjB61/lHycNRFHLpQ5phmCDZMn5lFXV8Fl1b6AE34180IXGcyEVj63i4A4cVix7WiURyVq1jVXCi3WtuTp9CMvEm6aDsoMpjcCO9gtZyALg4NkedxPdomOqc+YgKxElBLF5XczfKMbK8NjEIhBVFLl4Jmx4C8Kren4QHQ2rp6MRIjnta5ReN0/sQq+tb7tx+qR8TD3QBCSMjpWMGFo0Eo7kTu7UmkWuA7fAYlEAdk+FbHnonjf+xG/hEUIEPHcgBsAY3dDI2thoSz2tuYuor+dxPNFQpfFChwtQ/Tg9BG7yawLtuI2o6Jwgk9pbN9dIU+o4f9tHEilwZkdNYlBGHHXc9P4jvkM3FYApzSLLlGXQqeWcw7hzxY3WFvay0eRNZe6mqFH8Xjoj7TU5IVm73XnVzQfi4K4LCaxmOFiExJX2mQxHkqWE08xIIdeILMk25i+xrCRrO41osqRb2DUBgIzYUH7X1y/HCetoRgzb5rrek3E7psgE+o3MXXhKPHI5lzXBTJY0MBHRJf8VLCm2FyvpeK4yR6zl4BaU5n6j5UrzLzbpa5yEjnGqxAr8VFqXt1LutrVlSUpyiBBj9q1XTq4TufUXcT8tVUDfVo58fl0h8CSjOjzril+w/8DrQrmTpvIzvkQV79htnf8haEeyp4IGxcd8I7LIPraXC0Dz3AdLUm0HkDRw/4UOByHPwj9R06W9jZzvoPIAJshtna0CMM55x7thZq49IMpKGk582Mdi593x/cl/VnCKsES7T04KF8mWxWW3IlIQ23SHowZPlfWcIXWROcIflTj2TdNmpps8Byg3XGEw723ietNTqY6TEGEP8vH64WQwEd0yaFC10UG6qpcRBkNaMfGztk4iLqBqPC1QWPQUQVZDu189mSifM6ZSjMksBFdEQyQqycR1cgSV6n50nx7uMCIusUUUjxB6nFTh3lJmNmfgsZ3IvIyD33n7OsCHRvfaDJDbzmYimXTy93rlafxjJ7okDIuYNjbGWUOTgl+SGuCd/cnqU6D6ORUP70nbBypwtbUpc6BBFj8lHx2xVSCQDbqv8Rm",
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
