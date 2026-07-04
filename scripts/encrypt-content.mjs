// Verschlüsselt den Inhalt für src/lib/protected-content.ts.
// Nutzung:  PW='dein-passwort' node scripts/encrypt-content.mjs
// Danach die JSON-Ausgabe in PROTECTED_PAYLOAD einsetzen.

import { webcrypto as crypto } from "node:crypto";

const PASSWORD = process.env.PW || "diesandhoffs";

const content = {
  ablauf: [
    { time: "14:00", title: "Standesamtliche Trauung", where: "Köllenhof, Wachtberg-Ließem" },
    { time: "16:30", title: "Gartenfest", where: "Bonn-Ückesdorf" },
  ],
  locations: [
    {
      label: "Trauung — 14:00",
      name: "Köllenhof",
      addressLines: ["[Straße + Nr.]", "53343 Wachtberg-Ließem"],
      maps: "https://maps.google.com/?q=Köllenhof+Wachtberg-Ließem",
      note: "Parkplätze sind vor Ort begrenzt vorhanden — Fahrgemeinschaften werden empfohlen.",
    },
    {
      label: "Gartenfest — ab 16:30",
      name: "[Location Bonn-Ückesdorf]",
      addressLines: ["[Straße + Nr.]", "53127 Bonn-Ückesdorf"],
      maps: "https://maps.google.com/?q=Bonn-Ückesdorf",
      note: "Parken in den umliegenden Seitenstraßen.",
    },
  ],
  hotels: [
    { name: "[Hotel 1]", distance: "ca. 5 km zur Location", url: "#" },
    { name: "[Hotel 2]", distance: "ca. 8 km zur Location", url: "#" },
    { name: "[Pension / B&B]", distance: "ca. 3 km zur Location", url: "#" },
  ],
  rsvpDeadline: "15. September 2026",
  contactEmail: "hallo@maibritundluca.de",
};

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const iterations = 250000;

const baseKey = await crypto.subtle.importKey(
  "raw",
  enc.encode(PASSWORD),
  "PBKDF2",
  false,
  ["deriveKey"],
);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
  baseKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt"],
);
const ct = new Uint8Array(
  await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(content))),
);
const b64 = (u8) => Buffer.from(u8).toString("base64");

console.log(
  JSON.stringify(
    { salt: b64(salt), iv: b64(iv), ciphertext: b64(ct), iterations },
    null,
    2,
  ),
);
