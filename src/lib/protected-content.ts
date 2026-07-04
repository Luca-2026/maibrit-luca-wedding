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
  salt: "AU328cljgpD6d4bufDat6g==",
  iv: "a0IBeUF7y+BjB98u",
  ciphertext:
    "J462fbGWl+gPalP9WKCWCDFkTOz9c2IRqF77TtyzQVFbHWjhfRCenmakk4p3Td6FMuTJd9pN9ggr7jwx7QCu8hGVcSyY2GdMkikkTRJcX3jE+TBIfPGoQoxZMBPDC+MuamPlXIokNDXS8Xw3DyIzSk93X/OkAA2rPmJ33+w2sleiXJ0L4icXrXBCJ9oIdQqLcXCRGkWr0YY0W2eyGD/ouWZfgSJcZmLSavhCcMihqsur/ZZ0fydM1y2pqyw9yRF+7ZcwjUXAobfWgQP/XO5WSbNLv4HReYG76yL8b9pTc4aLl7B8ADcRMh4SHN/nQqYFoTgxesImfdUenIXPDKLlS/iE1c2sNZFRJpnVLuGNjkqSs7AxAcGpkFtVQWx3eiAm13Nyx2JUY8MR4iXwIw87+H5oUGr26AHa5PQRXL+DXyI9iOw6vCa8WcCx7LaB8/SD/Fln2xfjKml1AqNU9bXYea/UlJuAfES8TpwtfVByaXjn4Z+1AvPiS6ZXwWezZGZKFVLwAQ6nzKroMIOAFBJMoLRy2fvrb66c2NDsNe4KveVM8AhhqKKqzqz5m2qDjnOXL0Q44FA0K8f/s5Fyh7M7piUozPqXluCcs/KFZ9hZN7j/lh46EA/NWPnnglVht2DsWNYWmJaNpehQ5ewXNUyNtbx9s8+I1O0LrrPxjRSXN21eDhBHMtWLJNbZQOI3bvlvdNqC9GyilcFjR0Ca6tOMzrHY3D8OwhlRXiURCw8YSCslE1hRdc8meJ3HZwOYFb6OymNgFWayfV7NZjgzuHeB2x6Y2NVmIJwbOTEssV9bI0yXkT6c2fv73htOS+AC+d16rM3pHEYEMYpEwbSqzQ/TRrDLWMB9ORxsQuiXsyaJshvFsxvXvtilX7cqozYSY7YVlbo9/d9ZuapuD3+5KTGyN6ZVLGwAuHqKHMxe1eQX8OzrK8o9FsRtMyocGmC6t+5RHYo2pXkLcPgcK8s7b3dgQ8NIIxr7liH4eJu01kRO7GNtgGpEhLlMybjpVomv901joryb12VxIlAhuYgAgio4sC6YjJ/7xYQ6j5Vng8LMyoCH42m0gYio4ihqw+a57CKDTkzvi45yQ4lUBXAm8m746Lhsz0yArnVMK0Bc/HMeQ1+1yh8cIQAAQW7ZYGazqvqZVIJl5EDYj48wDwCcuQv8OQM1OvFATqRR6zXHcw/fiu9IVVfeZ4oGKYHWDFcpXDoHdKmHrXN2w29eFLvdrDC3C06M2TCsxxUMBNRfYeQToV+qIxCnpGxzdNuAmOIpPQStBq6gU99emg932yAxEGdOdUm34KBXSFQFrJgPszg8zibQMGgIE+k34ZaumTAm9Pp6Kv+7fJBvUxIZwNeCftLcp7bjWxf/edsR5QROhEGXFOnRz5XAeCxFF3zN3Y5fLoRHdRF7HZ4/iivlzQVO2JiC2Jn9NkFVrf1T/UbHultfD10dVwBBacTilHlyeWhGp+CPbcNVa1+lxBW3/Ox4UGyv3qTW8rxItIaEpkvEqrieBgOliXmQw2Dyxa2UdzMKrgiYGD2S6eCCLcHwCbFruvTdeUsJr9ymcZ1C7lWWqK+dP98D/mMQ3sGh6A8jMIUhYvrzNn+UuEEkeg+YvrtrKZ2ZFoUXUZqAlGxiF/OfGFFDCvdS1xjovC/LOdZnasgXvI1pI8zy4g==",
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
