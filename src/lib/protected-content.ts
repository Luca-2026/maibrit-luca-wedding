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
  salt: "5wOnPb/6vTdTukmDPFn/lw==",
  iv: "G5xjkQACyJSwsqt4",
  ciphertext:
    "RmALG9321gze1LSMDdgaM0xlNgPafWiishKMJwSV7oKT5MAAI1bqFIsfT8AC87/DmAPsa9jgLI8wmHSnD+uOTOyTacK4OPRAteZX6g1857MgV9jrtMXQXAJjlRIBPK5xyCcdsVLi1uE2GOVf8tDKDJAadhKALZEX4e+Kc/nAGx5ofKthIU/fLewNkFYC1+QgV5EH7SYUJqmpvtx3sXbrT5Yz0jwfIlNLxA4kZoGj03+0M0uH1Dar2Ps1VpF6o/INWmZcTYyJc3P3t8COebk22ahCGyKPkcmIpQtrpQ/k6eVaPdBst9ivfQvz63y1cZd2qE8zPi9YccO4SW7oB42lz2s8J328Nu75w0fLmnoqvslvhkjbv1ve4hwRkFAE79LRzG4iT42B3+8/+orWdS15gwjMUKz+8+8NSO1DotF4WRcztoQzvnyItCQM2cQieu7LReDBHrRfBsae1waNuybs+6DinTdK7NTa3DzyaOkcLLS4ih1EHbHr0RGJd9InaXR6vMoRzfHR455XDfFyXYIK0KofmjwI/cT+2uKsKPoKCImqKdizA+xM5O/v4Kg7fK5XEHDrweQQzkUMP6+lx2Jk8kxLuARfaYlJb7JkwpqgOEvaUOxW0Is2Dsl2wZDLU0jzR4VDY5y84Z1vOD12WWejwIcXTULmtAJZTMbWDi8vqaZQLqS0dOXzLdB8BKJ+ie1foMIYpGmKhvpVHAoRSDQnV3irguPo6VQWrz0PMErIkLmWnAnsVxylTEQta6GhTjTiLJMAht4ENjXwDrtRDmH6JdBmAEMXeDv/HcPJgVDBsVuf1qCxrpicfYHQEqg9rBfl6xBzJ7O7NDeWOzWeldRBFJPikH0ql7v+u0Vg+VwJ426oBiQt2FOMQnkyuy9zlVBYAgTopLH4O2JImKUAdHPa58Hsy61BtRqQeML5YV8A087BthdhveZzUUlhENBeZsAO1RHn2V/b8hNGjw9DaWNHh7rK46HHZx6+G3ZpJlYM77ZONApTj+oT86e5NXLyLrY7h6pUf2C0izaX/Oyy6WA4fyr/GZoKk0eJ9JL3iKlyhg3OeFl5oymnwsBGwP52/usq68xQmNq5U+iB2apAD776byHb7el1pvmV9aWwGYWWUUPNazSpA9jUP+m3rdp3J6tf9ms6GOAE0zyLGSvUfHdKr1xLartT50ZdX6Y0RSJvcyFeDWqg8runz/vkd6cnVia3vUWhI5WLSNQdTr0T5s0/DZ+WV3qc0zAVHt3BFxIFCmSQXJKewO/3baQDJOsz8gyiy462B/XpA3sH9rG02ltJyAh0A9SXKBykU+4/cmEWdhCnRX/mC0hziRyZ7xwpSxry5koPB+GtvNrSv3lrvIjKel6MASasz9Jx23EBLKssxdBFEIzcnyn9D/OuL+jWnb6+dOZ4dVElvgBjwuvL8i/224ojsB4eunDh2UfjbBv4OXwe5tVuOOSGiuTZ5OBJGUBpzHbmQGw+YxNIOFsTUuA9LuuLdKy8BjX3LO2x38Vr5qw+MUJpB6gzwO46wp5bl8w9BQBVhcg2ZR2JL+0vuSdt5CBVBKAzm+RNMnnkbECS7Cb9qHameTH5FaGhEXxLgABQb8LFx5WizOB7dToxSM1JXB6F4OAkjDSrl7JCPdvc+lyVEfWHp6hj/8Hy5gJ4COCG53dJGv6ycvTbl8sn1tDXtMZsQ0lBqOjdPsm/bu+ZWxjknc2HbpDiNGgdh2ztwEYoDSzcgrrReNGuXe2i9dE1fOy4cD/SSSafZYEzN759",
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
