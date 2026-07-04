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
  salt: "VqBcDFW3mXZDr+UIbdSznQ==",
  iv: "MNUPbLFt05XB5m4T",
  ciphertext:
    "ctsY3exrczv3Sfe0OaLpmxXqfkZYUYXqXt5GM8hh8BPhk6ib33yGM9b3RDINa2nE0H4wWP3SmWhWRvnFuivxya77dKWHJEgp+o3UYWUgGAx/6crh2Phk6QMvr3LBRnt5JEZVrcnde2lXiuVSLuKGbdiiWdBzKwmrMBrw4XCQ9BnIi/NP3buXFrT5MkU50OJlC95ZNQX6Cr8SUqfv3V3M6zCpTxWIohD+Pqt98k7d1OEiSeNG3jYAnqiIr42m8w1NxgKcpQ0BsGKf5+eMxJ1/0rj1bLwKPlC8vHWaPPEFRcRr/ukHFLd9XZmSXK1zL/6Chf4W50WuddOTNzrumONO2XEcp3RLpBFmAg030jSgxz1FnioYox82nQfCOjoUM9+H0TrPG8Mb6uPb4TTaI/CicKKFL8gUA+5rExhV5J0SkfY9Jtuov5oAh6v4zCBA85o2jKIUb3AYXBfR1q2/GlU8OKNLxitqvRrp66R4AF6Xm/DxImn+s/Mz+1vDwUFLChrVbaaGSMkOBFlzC8RbHDC3MKDj7uG38ki9FlFXYomha4suWDVycIXloTlnqfta3FS0omIys4ZgWkiFWjrTzCo9r4IUPhcL6VOGsr5qz3iDKNaIytPsGSL8vayPdyIHOex3Ft70GCR8OOk0J0n6PDqaNwGEpEotGslZ1xGfuG3RmB/rExAyA5ywTQ+ZdqBfaGclCeiwzSfWznB1PiXbuakGH9UsqtBvmQ0VRED1TlKhwAlA/5IYmxDkruWjsHuGODiu2aIT0iSsBzqEHNdNKosPrNe+ZOjKFNbGEDOM6uh/lf+tQHn2QuWsLv2gRI6BrhHzZBQFYWEY0zWAdgnHb7Alfk2vv7I3g6UnBSR0L1cLcNwlHyGxfMYdP7bVZfqR4ghGpbluNpu8telU4GmNpvM8f6dIsOgmu1P/AsALquWM4kfJk9Hl7cJJq8LcR2lktBQC6Z1MRfr6VcIzlx15/d3a03Lj3v+MxgSns0q2kSv+D6eQ9qLWlejhaa2bc4INknRuFRftC8pOkevj8Gkqeum+6jGj7vSiLG5J6bL1CpvwesE5lQ3yah0v+htYiM/YfcoO0CskeIW1Nt+44vvBgfs2XL0Fg9UkOGvcrZgwGWZGR/4xQD9ha+15IBy55QsvpNdpIipY2BDsAzfIdBrFzl1ibiZMfFACNBXveov/f3ryKvlIPdy78u1easpNNnuo9J0eDzSAQPj6UnLaOZykytFgbcwAKLKbWRuDloEDXX6Kexz93jbb+gKCwEtRpn51sC5/xuJgqUz6U02mWdbksd9/OEmv2fBFYfn+WL1FNZMV0Yqj",
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
