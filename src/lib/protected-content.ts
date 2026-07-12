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
  salt: "XUKQ+BSCk3qzmMZgfCFVoQ==",
  iv: "PsB1ORAYsq/MR9dY",
  ciphertext:
    "x3Ypg3GKHu8nsv//YHssmbKla98aaR9VHdcnYHeO7hhZVeDrOzjznTTHZSItD8s4lSsvmjxItwo0ELNeYWR3gx9e+ht8tfwIhogwywqws5v7Eu0IsIS9EXRN/DaBBvp3qyMDEhU66AUozVfcC+/cUVXo5ZdAGQ+MKKrV9vGovNtfdB7WpHeJ+x12lMWrROCda9ImuUNK/89VcPCnCltRqbIFPmLEuME/rLxadWlmRJIqdYvZdzCHbekAIV8sORa9kGPICg/jp66Z3qqsuCQ6AbiU9wgy/3KA4zZ9fAOtPgA9lgIJYzUp37ByQywF4qdcN7q1nC8S8Qm8yPZqOoZkM6IUhxJzh1lU4zrjKpa3M705ZuvcyXpWJXYHrHDGrNTNJZBcz05NSWJY7xT8dUwekeIzMCqn6nzwYX3F4NV6EuR87U1YoCu8FqzgwCHJov8vFbvcUemw+ptkrjTW9NQq0lr75bh3SycY9WkAPKdSK4J1gWHWYJWuIDkvZKeKPvnwbp47pIlkSDBJzCPkYwau6h/a74zcueTAbSIZu+hCMiuRekGT5VV512F6+fAPAldwMZuRmyufPkvKsQhTFB0zfTU3nDm9ZvuT4cMZDykTdVHbcGyN/CQPyEJnz2WMXZ+5SHkDfaZc8vN9RbYmFgz+DWC8mbkCNwUQJsbEY9B4EQ3Txl9UOlKMb5sNjjbqOiinoE9GQg5UKFdmnXzPsatSRuUhpvtLvQrflFJC69G6mzESAsjEzKVcUo4T0iccbq/bTq1GOSSup8asFmH4ky0e9zhIFK7c/ZgXLVtV1QbG/OMUO9L1QDgXVmj8as7Exw1WC7qnPLRaKXlK5w3dBvbb4Nv5x1O3Yl2cFgM9wYLBUQJVYN9Z/fhhIzKj5f7xH2pXxy8xSV6uP8rTPU5jrWapx3SfAIWSqDuDHikCgAm5UZna2k4z/qXY5FvDPvloQayPH0w+1efOBFLK+JvlU15rCTHTgwrXS0caH0ctqGm0giFL6FBGefMH/gzIWTOWTODaPLT4MPt08peeQCISQz8yrw4O84RyCJRHM4MMeqSF2/Rb3I0GXN02sby9g3OGVJZT461zJJiKK7ee+q/Aq2BjbrI9SwJCp6tWGgeVZ+P3JgswkX7Ezh+nzWWGvfxzifWBgoZhmuykP4gCAni2uoEh+1wXqZU1JlJtKpMnGqNsLHmqtF5Gv91xpkLCswyfaIL9QqSx6iXb08Ma31zHaxQpgUB5qLUxzZnS4MxwMk6N2+6ux6JYIirzs30peuQJh2BhWtIr2RLke9nTZyjeHhcOL8iiQQTUmdKlp5oK/uz+N8d6NI3AyuvTbfW+nZpUHS9V5RIpsPDC90exzvy1TshP3UiQCGGY6D+E7/1uZF9+xNaKXOxmtqoo62K8o7Mjszzv9h3vHzf1zgNuInnBY84CSzh93v6E12C98PDQ7jtPTSXGkY8QXYXDffvwj9f/2fHra1ZUM7IfD48R+YtcCJAGYfChj6jTru+sVm6htmbp2c6K54bgrkq3RonBaaUjbjEJK+RAfibQXvqsUlt4x7eomxU256nDzar49njZ+UNp5ijRMSH+rCxqNRHFgvG9Y+niIGZRZH5RIKYl8kgxlg7tPu3MKuj4g8wwT/NMLIj/MhJFea61RU73jx2oaGxMJRFvCq/4vqvoDyoOUE4EVGAFDGlZ6k4LPPFm9aFBsVGT/kZbwCSYi8CH2X/gcHx85Us4fN3buvoTQusV3MUoDTaOao8OP9PDO8iAkhA1yJHbIC/hPq+BRsiIi80RUr5zEpbnH9IL2vF61LpRkQXNrGn+ztE8EHob40JYQjS4WBpgGhzy",
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
